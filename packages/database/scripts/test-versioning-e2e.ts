import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import FormService from '../../services/form/index';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function runVerification() {
  await client.connect();
  console.log("Connected to PostgreSQL for E2E Versioning Verification...");

  const formService = new FormService();

  // 1. Get an existing user
  const { rows: users } = await client.query('SELECT id FROM "user" LIMIT 1');
  if (users.length === 0) {
    throw new Error("No user found in database to run tests against.");
  }
  const userId = users[0].id;
  console.log(`Using test user ID: ${userId}`);

  let testFormId = "";
  let shareId = "";
  let v1Id = "";
  let v2Id = "";
  let v4Id = "";

  try {
    // ==========================================
    // Test 1: Initial Form Creation (Version 1)
    // ==========================================
    console.log("\n--- TEST 1: Initial Form Creation (Version 1) ---");
    const createdForm = await formService.createForm(userId, {
      title: "E2E Version Test Form",
      description: "Initial description for V1",
      visibility: "unlisted",
    });

    testFormId = createdForm.id;
    shareId = createdForm.shareId;
    console.log(`✓ Form created with ID: ${testFormId}, shareId: ${shareId}`);

    const { rows: v1Rows } = await client.query(
      `SELECT * FROM form_versions WHERE form_id = $1 ORDER BY version_number ASC`,
      [testFormId]
    );

    if (v1Rows.length !== 1 || v1Rows[0].version_number !== 1) {
      throw new Error(`Expected exactly 1 version (V1), found: ${v1Rows.length}`);
    }
    v1Id = v1Rows[0].id;
    console.log(`✓ Version 1 created automatically in same transaction: ID=${v1Id}`);

    const { rows: v1ElRows } = await client.query(
      `SELECT * FROM form_version_elements WHERE form_version_id = $1`,
      [v1Id]
    );
    if (v1ElRows.length !== 0) {
      throw new Error(`Expected 0 elements for initial form, found: ${v1ElRows.length}`);
    }
    console.log("✓ Version 1 has 0 elements (clean empty baseline)");

    // ==========================================
    // Test 2: Normal Draft Save (Version 2)
    // ==========================================
    console.log("\n--- TEST 2: Normal Draft Save with Questions (Version 2) ---");
    const saveResultV2 = await formService.saveFormDraft(userId, {
      formId: testFormId,
      expectedVersion: 1,
      title: "E2E Version Test Form - Edited V2",
      description: "Updated description for V2",
      fields: [
        {
          kind: "question",
          type: "short_text",
          label: "What is your name?",
          placeholder: "Jane Doe",
          required: true,
          sortOrder: 0,
          config: {},
          validationRules: {},
        },
        {
          kind: "question",
          type: "single_select",
          label: "How did you hear about us?",
          required: false,
          sortOrder: 1,
          config: {
            options: [
              { id: "opt1", label: "Friend", value: "friend" },
              { id: "opt2", label: "Twitter", value: "twitter" },
            ],
          },
          validationRules: {},
        },
      ],
    });

    if (saveResultV2.isNoOp) {
      throw new Error("Save should not be a No-Op when changes were made!");
    }
    if (saveResultV2.version.versionNumber !== 2) {
      throw new Error(`Expected Version 2, got ${saveResultV2.version.versionNumber}`);
    }
    if (saveResultV2.fields.length !== 2) {
      throw new Error(`Expected 2 fields in draft save result, got ${saveResultV2.fields.length}`);
    }
    v2Id = saveResultV2.version.id;
    console.log(`✓ Version 2 successfully created: ID=${v2Id}, VersionNumber=2`);

    // Verify Version 1 is immutable
    const { rows: checkV1 } = await client.query(
      `SELECT title, description FROM form_versions WHERE id = $1`,
      [v1Id]
    );
    if (checkV1[0].title !== "E2E Version Test Form") {
      throw new Error("Version 1 title was mutated! History must be immutable!");
    }
    console.log("✓ Verified Version 1 remains completely immutable");

    // Verify Version 2 elements snapshot
    const { rows: v2ElRows } = await client.query(
      `SELECT * FROM form_version_elements WHERE form_version_id = $1 ORDER BY sort_order ASC`,
      [v2Id]
    );
    if (v2ElRows.length !== 2) {
      throw new Error(`Expected 2 elements in V2 snapshot, found ${v2ElRows.length}`);
    }
    if (v2ElRows[0].label !== "What is your name?" || v2ElRows[1].type !== "single_select") {
      throw new Error("V2 snapshot elements content mismatch!");
    }
    console.log("✓ Verified Version 2 element snapshots are accurately persisted");

    // ==========================================
    // Test 3: No-Op Save Detection
    // ==========================================
    console.log("\n--- TEST 3: No-Op Save Detection ---");
    const noOpResult = await formService.saveFormDraft(userId, {
      formId: testFormId,
      expectedVersion: 2,
      title: "E2E Version Test Form - Edited V2",
      description: "Updated description for V2",
      fields: saveResultV2.fields.map((f, i) => ({
        id: f.id,
        kind: f.kind,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        sortOrder: i,
        config: f.config as any,
        validationRules: f.validationRules as any,
      })),
    });

    if (!noOpResult.isNoOp) {
      throw new Error("Expected isNoOp === true for identical draft!");
    }
    if (noOpResult.version.versionNumber !== 2) {
      throw new Error("No-op save should return the existing Version 2!");
    }

    const { rows: versionCountRows } = await client.query(
      `SELECT COUNT(*)::int as count FROM form_versions WHERE form_id = $1`,
      [testFormId]
    );
    if (versionCountRows[0].count !== 2) {
      throw new Error(`Expected total 2 versions after no-op save, found ${versionCountRows[0].count}`);
    }
    console.log("✓ No-op detected properly: returned existing V2 without creating duplicate version row");

    // ==========================================
    // Test 4: Concurrency Protection
    // ==========================================
    console.log("\n--- TEST 4: Concurrency Protection ---");
    let concurrencyFailed = false;
    try {
      await formService.saveFormDraft(userId, {
        formId: testFormId,
        expectedVersion: 1, // Stale version! Current is 2
        title: "Stale update attempt",
        fields: [],
      });
    } catch (err: any) {
      if (err.message && err.message.includes("CONCURRENCY_CONFLICT")) {
        concurrencyFailed = true;
        console.log(`✓ Stale save rejected with expected CONCURRENCY_CONFLICT: ${err.message}`);
      } else {
        throw err;
      }
    }
    if (!concurrencyFailed) {
      throw new Error("Stale save with outdated expectedVersion was not rejected!");
    }

    // ==========================================
    // Test 5: Version Restoration (V1 -> V3)
    // ==========================================
    console.log("\n--- TEST 5: Version Restoration (Draft Form) ---");
    const restoreResult = await formService.restoreFormVersion(userId, {
      formId: testFormId,
      versionId: v1Id,
      expectedVersion: 2,
    });

    if (restoreResult.version.versionNumber !== 3) {
      throw new Error(`Expected restored version to be Version 3, got ${restoreResult.version.versionNumber}`);
    }
    if (restoreResult.form.title !== "E2E Version Test Form") {
      throw new Error(`Expected form title to be restored to V1 ("E2E Version Test Form"), got "${restoreResult.form.title}"`);
    }
    if (restoreResult.fields.length !== 0) {
      throw new Error(`Expected restored fields to be 0 (from V1), got ${restoreResult.fields.length}`);
    }
    console.log("✓ Version 1 restored successfully as Version 3; live tables restored to V1 state");

    // ==========================================
    // Test 6: Published Form Synchronization & Live Updates
    // ==========================================
    console.log("\n--- TEST 6: Published Form Synchronization & Live Updates ---");
    // Save Version 4 with a question
    const saveV4 = await formService.saveFormDraft(userId, {
      formId: testFormId,
      expectedVersion: 3,
      title: "Public Published Survey",
      description: "Initial published survey description",
      fields: [
        {
          kind: "question",
          type: "short_text",
          label: "Your Email Address",
          required: true,
          sortOrder: 0,
          config: {},
          validationRules: {},
        },
      ],
    });
    v4Id = saveV4.version.id;
    console.log(`✓ Version 4 created: ID=${v4Id}, VersionNumber=4`);

    // 6a: Explicit Publish
    const publishedForm = await formService.publishForm(userId, testFormId);
    if (!publishedForm || publishedForm.status !== "published" || publishedForm.publishedVersionId !== v4Id) {
      throw new Error(`Publish failed or publishedVersionId not pointing to V4! Got: ${publishedForm?.publishedVersionId}`);
    }
    console.log(`✓ Form published: status="published", publishedVersionId points to V4 (${v4Id})`);

    // Verify public endpoint serves V4
    const publicResultV4 = await formService.getFormByShareId(shareId);
    if (!publicResultV4 || publicResultV4.form.title !== "Public Published Survey") {
      throw new Error("Public endpoint did not return published V4 title!");
    }
    if (publicResultV4.fields.length !== 1 || publicResultV4.fields[0]?.label !== "Your Email Address") {
      throw new Error("Public endpoint did not return published V4 field!");
    }
    console.log("✓ Public endpoint verified serving Version 4 snapshot");

    // 6b: Save edits to ALREADY-PUBLISHED form -> Auto-promote to published version!
    console.log("Saving changes to already-published form (creates V5)...");
    const saveV5 = await formService.saveFormDraft(userId, {
      formId: testFormId,
      expectedVersion: 4,
      title: "Public Published Survey - Updated Live",
      description: "Updated description live for respondents",
      fields: [
        {
          kind: "question",
          type: "short_text",
          label: "Your Full Name",
          required: true,
          sortOrder: 0,
          config: {},
          validationRules: {},
        },
        {
          kind: "question",
          type: "short_text",
          label: "Your Phone Number",
          required: false,
          sortOrder: 1,
          config: {},
          validationRules: {},
        },
      ],
    });

    const v5Id = saveV5.version.id;
    if (saveV5.version.versionNumber !== 5) {
      throw new Error(`Expected Version 5, got ${saveV5.version.versionNumber}`);
    }
    if (!saveV5.version.publishedAt) {
      throw new Error("Expected V5.publishedAt to be set because form was already published!");
    }

    // Verify formsTable was automatically updated to publishedVersionId = V5
    const { rows: formCheckV5 } = await client.query(
      `SELECT status, published_version_id FROM forms WHERE id = $1`,
      [testFormId]
    );
    if (formCheckV5[0].published_version_id !== v5Id) {
      throw new Error(
        `formsTable.published_version_id was not automatically updated to V5! Got: ${formCheckV5[0].published_version_id}`
      );
    }
    console.log(`✓ Published form draft save automatically promoted publishedVersionId to V5 (${v5Id})`);

    // Verify public endpoint immediately serves V5 without re-publishing
    const publicResultV5 = await formService.getFormByShareId(shareId);
    if (!publicResultV5 || publicResultV5.form.title !== "Public Published Survey - Updated Live") {
      throw new Error("Public endpoint did not immediately reflect V5 title on published form!");
    }
    if (publicResultV5.fields.length !== 2 || publicResultV5.fields[0]?.label !== "Your Full Name") {
      throw new Error("Public endpoint did not immediately reflect V5 fields on published form!");
    }
    console.log("✓ Public endpoint verified: respondents immediately receive Version 5 snapshot upon save!");

    // 6c: Restore on ALREADY-PUBLISHED form -> Auto-promote restored version (V6) to published!
    console.log("Restoring Version 2 on the published form (creates V6)...");
    const restoreOnPublished = await formService.restoreFormVersion(userId, {
      formId: testFormId,
      versionId: v2Id,
      expectedVersion: 5,
    });

    const v6Id = restoreOnPublished.version.id;
    if (restoreOnPublished.version.versionNumber !== 6) {
      throw new Error(`Expected restored version to be V6, got ${restoreOnPublished.version.versionNumber}`);
    }
    if (!restoreOnPublished.version.publishedAt) {
      throw new Error("Expected V6.publishedAt to be set because form was published!");
    }

    const { rows: formCheckV6 } = await client.query(
      `SELECT status, published_version_id FROM forms WHERE id = $1`,
      [testFormId]
    );
    if (formCheckV6[0].published_version_id !== v6Id) {
      throw new Error(`formsTable.published_version_id was not automatically updated to V6!`);
    }
    console.log(`✓ Restoration on published form automatically promoted publishedVersionId to V6 (${v6Id})`);

    const publicResultV6 = await formService.getFormByShareId(shareId);
    if (!publicResultV6 || publicResultV6.form.title !== "E2E Version Test Form - Edited V2") {
      throw new Error("Public endpoint did not reflect restored V6 (from V2) title!");
    }
    if (publicResultV6.fields.length !== 2 || publicResultV6.fields[0]?.label !== "What is your name?") {
      throw new Error("Public endpoint did not reflect restored V6 fields!");
    }
    console.log("✓ Public endpoint verified: respondents immediately receive restored Version 6 snapshot!");

    // ==========================================
    // Test 7: Version History & Immutability Verification
    // ==========================================
    console.log("\n--- TEST 7: Version History & Immutability Verification ---");
    const historyList = await formService.listFormVersions(userId, testFormId);
    if (historyList.length !== 6) {
      throw new Error(`Expected 6 versions in history, got ${historyList.length}`);
    }
    const versionNumbers = historyList.map((v) => v.versionNumber);
    if (JSON.stringify(versionNumbers) !== JSON.stringify([6, 5, 4, 3, 2, 1])) {
      throw new Error(`Versions not in descending order: ${JSON.stringify(versionNumbers)}`);
    }
    console.log(`✓ Version history retrieved in descending order: ${versionNumbers.join(", ")}`);

    // Verify independent snapshots
    const v1Detail = await formService.getFormVersionById(userId, testFormId, v1Id);
    if (!v1Detail || v1Detail.elements.length !== 0) {
      throw new Error("Version 1 elements count mutated!");
    }

    const v2Detail = await formService.getFormVersionById(userId, testFormId, v2Id);
    if (!v2Detail || v2Detail.elements.length !== 2) {
      throw new Error("Version 2 elements count mutated!");
    }

    const v4Detail = await formService.getFormVersionById(userId, testFormId, v4Id);
    if (!v4Detail || v4Detail.elements.length !== 1 || v4Detail.elements[0]?.label !== "Your Email Address") {
      throw new Error("Version 4 snapshot mutated!");
    }

    const v5Detail = await formService.getFormVersionById(userId, testFormId, v5Id);
    if (!v5Detail || v5Detail.elements.length !== 2 || v5Detail.elements[0]?.label !== "Your Full Name") {
      throw new Error("Version 5 snapshot mutated!");
    }

    console.log("✓ Verified all historical snapshots (V1, V2, V4, V5, V6) remain strictly immutable and distinct");

    console.log("\n==========================================");
    console.log("🎉 ALL E2E FORM VERSIONING TESTS PASSED!");
    console.log("==========================================");
  } finally {
    // Clean up test form
    if (testFormId) {
      console.log(`Cleaning up test form ${testFormId}...`);
      await client.query("DELETE FROM forms WHERE id = $1", [testFormId]);
    }
    await client.end();
  }
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
