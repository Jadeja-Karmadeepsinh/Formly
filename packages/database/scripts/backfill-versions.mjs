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

async function runBackfill() {
  await client.connect();
  console.log("Connected to PostgreSQL for Version 1 backfill...");

  try {
    const { rows: forms } = await client.query(`
      SELECT id, title, description, theme_id, settings, status, published_at, created_at
      FROM forms
      WHERE deleted_at IS NULL
      ORDER BY created_at ASC
    `);

    console.log(`Found ${forms.length} active forms to evaluate.`);

    for (const form of forms) {
      await client.query('BEGIN');
      try {
        // Check if any version already exists for this form
        const { rows: existingVersions } = await client.query(
          `SELECT id FROM form_versions WHERE form_id = $1 LIMIT 1`,
          [form.id]
        );

        if (existingVersions.length > 0) {
          console.log(`Form ${form.id} ("${form.title}") already has versions. Skipping.`);
          await client.query('COMMIT');
          continue;
        }

        console.log(`Backfilling Version 1 for form ${form.id} ("${form.title}")...`);

        // Determine publishedAt for Version 1
        const isPublished = form.status === 'published';
        const versionPublishedAt = isPublished ? (form.published_at || new Date().toISOString()) : null;

        // Insert Version 1
        const { rows: insertedVersionRows } = await client.query(
          `INSERT INTO form_versions (form_id, version_number, title, description, theme_id, settings, published_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            form.id,
            1,
            form.title,
            form.description,
            form.theme_id,
            JSON.stringify(form.settings || {}),
            versionPublishedAt,
            form.created_at || new Date().toISOString()
          ]
        );

        const versionId = insertedVersionRows[0].id;

        // Fetch current elements for this form
        const { rows: elements } = await client.query(
          `SELECT id, kind, type, label, content, help_text, placeholder, required, sort_order, config, validation_rules, created_at
           FROM form_elements
           WHERE form_id = $1
           ORDER BY sort_order ASC, created_at ASC`,
          [form.id]
        );

        // Snapshot all elements into form_version_elements
        for (const el of elements) {
          await client.query(
            `INSERT INTO form_version_elements (
              form_version_id, source_element_id, kind, type, label, content, help_text, placeholder, required, sort_order, config, validation_rules, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              versionId,
              el.id,
              el.kind,
              el.type,
              el.label,
              el.content,
              el.help_text,
              el.placeholder,
              el.required,
              el.sort_order,
              JSON.stringify(el.config || {}),
              JSON.stringify(el.validation_rules || {}),
              el.created_at || new Date().toISOString()
            ]
          );
        }

        // If form is published, link published_version_id
        if (isPublished) {
          await client.query(
            `UPDATE forms SET published_version_id = $1 WHERE id = $2`,
            [versionId, form.id]
          );
        }

        await client.query('COMMIT');
        console.log(`Successfully backfilled Version 1 for form ${form.id} (${elements.length} elements snapshotted, published=${isPublished}).`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`Error backfilling form ${form.id}:`, err);
        throw err;
      }
    }

    console.log("Backfill completed successfully.");
  } finally {
    await client.end();
  }
}

runBackfill().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});

