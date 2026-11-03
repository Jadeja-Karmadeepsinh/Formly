import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function repairPublishedVersions() {
  await client.connect();
  console.log("Connected to PostgreSQL to audit and repair published versions...");

  try {
    const { rows: publishedForms } = await client.query(`
      SELECT id, title, status, published_version_id, published_at
      FROM forms
      WHERE status = 'published' AND deleted_at IS NULL
    `);

    console.log(`Found ${publishedForms.length} published forms.`);

    for (const form of publishedForms) {
      // Find latest version for this form
      const { rows: latestVersionRows } = await client.query(`
        SELECT id, version_number, title, published_at
        FROM form_versions
        WHERE form_id = $1
        ORDER BY version_number DESC
        LIMIT 1
      `, [form.id]);

      if (latestVersionRows.length === 0) {
        console.warn(`Published form ${form.id} ("${form.title}") has NO versions!`);
        continue;
      }

      const latestVersion = latestVersionRows[0];

      if (form.published_version_id !== latestVersion.id) {
        console.log(
          `Repairing form ${form.id} ("${form.title}"): currently points to ${form.published_version_id}, promoting to latest Version ${latestVersion.version_number} (${latestVersion.id})`
        );

        await client.query(`BEGIN`);

        // Set published_at on latest version if null
        await client.query(`
          UPDATE form_versions
          SET published_at = COALESCE(published_at, NOW())
          WHERE id = $1
        `, [latestVersion.id]);

        // Update form's published_version_id
        await client.query(`
          UPDATE forms
          SET published_version_id = $1,
              published_at = COALESCE(published_at, NOW()),
              updated_at = NOW()
          WHERE id = $2
        `, [latestVersion.id, form.id]);

        await client.query(`COMMIT`);
        console.log(`✓ Repaired form ${form.id} to published Version ${latestVersion.version_number}.`);
      } else {
        console.log(`Form ${form.id} ("${form.title}") already points to latest Version ${latestVersion.version_number}. Valid.`);
      }
    }

    console.log("Published version repair completed successfully.");
  } finally {
    await client.end();
  }
}

repairPublishedVersions().catch((err) => {
  console.error("Repair failed:", err);
  process.exit(1);
});

