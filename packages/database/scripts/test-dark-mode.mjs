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
const userDataDir = path.resolve(process.cwd(), '.chrome-temp-profile-dark');

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows: sessions } = await client.query('SELECT token FROM session WHERE expires_at > NOW() LIMIT 1');
const { rows: forms } = await client.query('SELECT id, title FROM forms WHERE deleted_at IS NULL ORDER BY updated_at DESC LIMIT 1');
await client.end();

const rawToken = sessions[0].token;
const secret = process.env.BETTER_AUTH_SECRET;
const hmac = crypto.createHmac('sha256', secret).update(rawToken).digest('base64');
const signedToken = `${rawToken}.${hmac}`;
const formId = forms[0].id;

const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--no-first-run',
]);

await new Promise(r => setTimeout(r, 2000));

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
  const versionRes = await fetch('http://127.0.0.1:9223/json/version');
  const versionData = await versionRes.json();
  const ws = new WebSocket(versionData.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  const { targetId } = await sendCdp(ws, 'Target.createTarget', { url: 'about:blank' });
  const targetWs = new WebSocket(`ws://127.0.0.1:9223/devtools/page/${targetId}`);
  await new Promise(r => targetWs.addEventListener('open', r, { once: true }));

  await sendCdp(targetWs, 'Page.enable');
  await sendCdp(targetWs, 'Network.enable');
  await sendCdp(targetWs, 'Runtime.enable');

  await sendCdp(targetWs, 'Network.setCookie', {
    name: 'better-auth.session_token',
    value: signedToken,
    url: 'http://localhost:3000',
  });

  await sendCdp(targetWs, 'Page.navigate', { url: `http://localhost:3000/dashboard/forms/${formId}` });
  await new Promise(r => setTimeout(r, 4500));

  // Enable Dark mode in HTML
  await sendCdp(targetWs, 'Runtime.evaluate', {
    expression: `document.documentElement.classList.add('dark')`,
  });

  // Test 1: Desktop Dark Mode
  await sendCdp(targetWs, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Open dialog
  await sendCdp(targetWs, 'Runtime.evaluate', {
    expression: `(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const histBtn = btns.find(b => b.textContent.includes('History') || b.textContent.trim().startsWith('v'));
      if (histBtn) histBtn.click();
    })()`,
  });
  await new Promise(r => setTimeout(r, 1000));

  const darkDesktopRes = await sendCdp(targetWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'history_dialog_dark_desktop.png'), Buffer.from(darkDesktopRes.data, 'base64'));
  console.log('✓ Saved dark desktop screenshot: history_dialog_dark_desktop.png');

  // Test 2: Mobile Dark Mode
  await sendCdp(targetWs, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await new Promise(r => setTimeout(r, 1000));

  const darkMobileRes = await sendCdp(targetWs, 'Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'history_dialog_dark_mobile.png'), Buffer.from(darkMobileRes.data, 'base64'));
  console.log('✓ Saved dark mobile screenshot: history_dialog_dark_mobile.png');

  targetWs.close();
  ws.close();
} finally {
  chromeProc.kill();
  if (fs.existsSync(userDataDir)) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

