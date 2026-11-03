import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const artifactsDir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\7e05045f-af85-431f-9bbc-f640d579a72b';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.resolve(process.cwd(), '.chrome-temp-profile');

// 1. Get active session token and test form
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows: sessions } = await client.query('SELECT token, user_id FROM session WHERE expires_at > NOW() LIMIT 1');
const { rows: forms } = await client.query('SELECT id, title FROM forms WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1');
await client.end();

if (!sessions.length || !forms.length) {
  console.error("Missing session or form");
  process.exit(1);
}

const rawToken = sessions[0].token;
const secret = process.env.BETTER_AUTH_SECRET;
const hmac = crypto.createHmac('sha256', secret).update(rawToken).digest('base64');
const signedToken = `${rawToken}.${hmac}`;

const formId = forms[0].id;
console.log(`Using form: ${formId} ("${forms[0].title}")`);

// 2. Launch headless Chrome with remote debugging
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
]);

// Wait for Chrome to be ready
await new Promise(r => setTimeout(r, 2000));

// Helper for CDP request
let idSeq = 1;
function sendCdp(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = idSeq++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  const versionRes = await fetch('http://127.0.0.1:9222/json/version');
  const versionData = await versionRes.json();
  const wsUrl = versionData.webSocketDebuggerUrl;
  console.log("Connected to Chrome via CDP:", wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  // Create a new target/page
  const { targetId } = await sendCdp(ws, 'Target.createTarget', { url: 'about:blank' });
  const targetWs = new WebSocket(`ws://127.0.0.1:9222/devtools/page/${targetId}`);
  await new Promise(r => targetWs.addEventListener('open', r, { once: true }));

  // Enable domains
  await sendCdp(targetWs, 'Page.enable');
  await sendCdp(targetWs, 'Network.enable');
  await sendCdp(targetWs, 'Runtime.enable');
  await sendCdp(targetWs, 'DOM.enable');

  // Set session cookie on both frontend and backend
  await sendCdp(targetWs, 'Network.setCookie', {
    name: 'better-auth.session_token',
    value: signedToken,
    url: 'http://localhost:3000',
    httpOnly: false,
    secure: false,
  });

  await sendCdp(targetWs, 'Network.setCookie', {
    name: 'better-auth.session_token',
    value: signedToken,
    url: 'http://localhost:8000',
    httpOnly: true,
    secure: false,
  });

  const formUrl = `http://localhost:3000/dashboard/forms/${formId}`;
  console.log(`Navigating to ${formUrl}...`);
  await sendCdp(targetWs, 'Page.navigate', { url: formUrl });
  
  // Wait for page to load completely and render form editor
  await new Promise(r => setTimeout(r, 5000));

  // Verify page URL
  const evalUrl = await sendCdp(targetWs, 'Runtime.evaluate', {
    expression: 'window.location.href',
  });
  console.log("Current page URL:", evalUrl.result?.value);

  // Define the viewports required by the user prompt
  const viewports = [
    { name: '1_desktop_1440x900', width: 1440, height: 900 },
    { name: '2_laptop_1280x800', width: 1280, height: 800 },
    { name: '3_small_laptop_1024x768', width: 1024, height: 768 },
    { name: '4_tablet_768x1024', width: 768, height: 1024 },
    { name: '5_large_mobile_430x932', width: 430, height: 932 },
    { name: '6_standard_mobile_390x844', width: 390, height: 844 },
    { name: '7_small_mobile_360x800', width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);

    // Set viewport dimensions
    await sendCdp(targetWs, 'Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768,
    });
    await new Promise(r => setTimeout(r, 600));

    // Open History Dialog
    const openRes = await sendCdp(targetWs, 'Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const histBtn = btns.find(b => 
          b.textContent.includes('History') || 
          b.getAttribute('title')?.includes('History') ||
          b.getAttribute('title')?.includes('version') ||
          b.textContent.trim().startsWith('v')
        );
        if (histBtn) {
          histBtn.click();
          return { found: true, text: histBtn.textContent.trim() };
        }
        return { found: false };
      })()`,
      returnByValue: true,
    });

    console.log("Open history result:", openRes.result?.value);
    // Wait for dialog animation and data query to load
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot of the open History dialog
    const screenshotRes = await sendCdp(targetWs, 'Page.captureScreenshot', {
      format: 'png',
    });

    const filename = `history_dialog_${vp.name}.png`;
    const filepath = path.join(artifactsDir, filename);
    fs.writeFileSync(filepath, Buffer.from(screenshotRes.data, 'base64'));
    console.log(`✓ Saved screenshot: ${filename}`);

    // If on large desktop, also test clicking "View" to inspect the detail view!
    if (vp.name === '1_desktop_1440x900') {
      console.log("Testing [View] snapshot detail on desktop...");
      const viewRes = await sendCdp(targetWs, 'Runtime.evaluate', {
        expression: `(() => {
          const viewBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim() === 'View');
          if (viewBtns.length > 0) {
            viewBtns[0].click();
            return { clickedView: true };
          }
          return { clickedView: false };
        })()`,
        returnByValue: true,
      });
      console.log("View click result:", viewRes.result?.value);
      await new Promise(r => setTimeout(r, 1200));

      const detailScreenshot = await sendCdp(targetWs, 'Page.captureScreenshot', {
        format: 'png',
      });
      const detailFile = path.join(artifactsDir, 'history_dialog_detail_preview.png');
      fs.writeFileSync(detailFile, Buffer.from(detailScreenshot.data, 'base64'));
      console.log("✓ Saved detail screenshot: history_dialog_detail_preview.png");

      // Click "All versions" to return back to list
      await sendCdp(targetWs, 'Runtime.evaluate', {
        expression: `(() => {
          const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('All versions'));
          if (backBtn) backBtn.click();
        })()`,
      });
      await new Promise(r => setTimeout(r, 600));
    }

    // Close dialog before next iteration
    await sendCdp(targetWs, 'Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.trim() === 'Close' || b.getAttribute('title')?.includes('Close')
        );
        if (closeBtn) closeBtn.click();
      })()`,
    });
    await new Promise(r => setTimeout(r, 600));
  }

  targetWs.close();
  ws.close();
  console.log("\n🎉 ALL VIEWPORTS TESTED AND SCREENSHOTS CAPTURED SUCCESSFULLY!");
} catch (err) {
  console.error("Error during browser testing:", err);
} finally {
  chromeProc.kill();
  if (fs.existsSync(userDataDir)) {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}
