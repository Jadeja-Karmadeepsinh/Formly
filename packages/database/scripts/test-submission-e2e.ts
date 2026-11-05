import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import FormService from '../../services/form/index';
import FormFieldService from '../../services/form-field/index';
import FormSubmissionService from '../../services/form-submissions/index';

dotenv.config({ path: path.resolve(process.cwd(), 'packages/database/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function runSubmissionVerification() {
  await client.connect();
  console.log("Connected to PostgreSQL for Submission System Verification...");

  const formService = new FormService();
  const formFieldService = new FormFieldService();
  const submissionService = new FormSubmissionService();

  // 1. Get test users
  const { rows: users } = await client.query('SELECT id, email FROM "user" LIMIT 2');
  if (users.length === 0) {
    throw new Error("No user found in database to run tests against.");
  }
  const creatorId = users[0].id;
  const otherUserId = users.length > 1 ? users[1].id : "mock_other_user_id";
  console.log(`Using creator user ID: ${creatorId}, other user ID: ${otherUserId}`);

  // Pre-cleanup in case a previous run left records
  await client.query(`DELETE FROM form_answers WHERE form_version_id IN (SELECT id FROM form_versions WHERE form_id IN (SELECT id FROM forms WHERE title LIKE $1))`, ['%Submission Verification%']);
  await client.query(`DELETE FROM form_submissions WHERE form_id IN (SELECT id FROM forms WHERE title LIKE $1)`, ['%Submission Verification%']);
  await client.query(`DELETE FROM forms WHERE title LIKE $1`, ['%Submission Verification%']);

  let testFormId = "";
  let shareId = "";
  let v1Id = "";
  let v2Id = "";
  let q1Id = ""; // Full Name (required short_text)
  let q2Id = ""; // Frequency (required single_select)
  let q3Id = ""; // Feedback (optional long_text)
  let q4Id = ""; // Rating (required star_rating)
  let q5Id = ""; // Ranking (required ranking)
  let contentHeadingId = ""; // Layout content heading (cannot accept answers)

  try {
    // ==========================================
    // Phase 1: Setup Test Form with Questions
    // ==========================================
    console.log("\n--- SETUP: Creating test form and questions ---");
    const createdForm = await formService.createForm(creatorId, {
      title: "Submission Verification Form",
      description: "Testing end-to-end form submissions and snapshot integrity",
      visibility: "unlisted",
    });
    testFormId = createdForm.id;
    shareId = createdForm.shareId;
    console.log(`✓ Form created: ${testFormId} (shareId: ${shareId})`);

    // Add layout content element
    const headingField = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "content",
      type: "heading",
      label: "Participant Information",
      content: "Please provide your feedback",
      sortOrder: 0,
      required: false,
    });
    contentHeadingId = headingField.id;

    // Add Q1: Short text (required)
    const field1 = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "question",
      type: "short_text",
      label: "Full Name",
      required: true,
      sortOrder: 1,
    });
    q1Id = field1.id;

    // Add Q2: Single Select (required)
    const field2 = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "question",
      type: "single_select",
      label: "Feedback Frequency",
      required: true,
      sortOrder: 2,
      config: {
        options: [
          { id: "opt_daily", label: "Daily", value: "Daily" },
          { id: "opt_weekly", label: "Weekly", value: "Weekly" },
          { id: "opt_monthly", label: "Monthly", value: "Monthly" },
        ],
      },
    });
    q2Id = field2.id;

    // Add Q3: Long text (optional)
    const field3 = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "question",
      type: "long_text",
      label: "Additional Comments",
      required: false,
      sortOrder: 3,
    });
    q3Id = field3.id;

    // Add Q4: Star rating (required, 1-5)
    const field4 = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "question",
      type: "star_rating",
      label: "Satisfaction Score",
      required: true,
      sortOrder: 4,
      config: { min: 1, max: 5 },
    });
    q4Id = field4.id;

    // Add Q5: Ranking (required)
    const field5 = await formFieldService.createFormField(creatorId, testFormId, {
      kind: "question",
      type: "ranking",
      label: "Priority Ranking",
      required: true,
      sortOrder: 5,
      config: {
        options: [
          { id: "opt_speed", label: "Speed", value: "Speed" },
          { id: "opt_design", label: "Design", value: "Design" },
          { id: "opt_reliability", label: "Reliability", value: "Reliability" },
        ],
      },
    });
    q5Id = field5.id;

    console.log(`✓ 5 question elements and 1 content element created`);

    // ==========================================
    // TEST 1: Starting Submission on Draft Form Fails
    // ==========================================
    console.log("\n--- TEST 1: Cannot start submission on unpublished draft form ---");
    let caughtDraftError = false;
    try {
      await submissionService.startSubmission({ shareId });
    } catch (e: any) {
      caughtDraftError = true;
      console.log(`✓ Correctly rejected: ${e.message}`);
    }
    if (!caughtDraftError) {
      throw new Error("Expected startSubmission on draft form to fail!");
    }

    // Now publish the form
    const published = await formService.publishForm(creatorId, testFormId);
    v1Id = published.publishedVersionId!;
    console.log(`✓ Form published as Version 1 (${v1Id})`);

    // ==========================================
    // TEST 2: Start Submission Lifecycle & Idempotency
    // ==========================================
    console.log("\n--- TEST 2: Start submission lifecycle and retry idempotency ---");
    const testAttemptToken = crypto.randomUUID();
    const startResult1 = await submissionService.startSubmission(
      { shareId, clientAttemptId: testAttemptToken },
      {
        browserName: "Chrome",
        browserVersion: "125.0",
        osName: "Windows",
        osVersion: "11.0",
        deviceType: "desktop",
        countryCode: "US",
      }
    );

    if (startResult1.submissionId !== testAttemptToken) {
      throw new Error(`Expected submissionId ${testAttemptToken}, got ${startResult1.submissionId}`);
    }
    if (startResult1.formVersionId !== v1Id) {
      throw new Error(`Expected formVersionId ${v1Id}, got ${startResult1.formVersionId}`);
    }
    if (startResult1.isExistingAttempt !== false) {
      throw new Error("First attempt should not be marked as existing");
    }
    console.log(`✓ Successfully started attempt: ${startResult1.submissionId} (V1: ${startResult1.formVersionId})`);

    // Retry with identical clientAttemptId
    const startResultRetry = await submissionService.startSubmission(
      { shareId, clientAttemptId: testAttemptToken }
    );
    if (startResultRetry.submissionId !== testAttemptToken || !startResultRetry.isExistingAttempt) {
      throw new Error("Expected idempotent startSubmission to return existing attempt");
    }
    console.log(`✓ Idempotent retry safely returned existing attempt without creating duplicate row`);

    // ==========================================
    // TEST 3: Validation on Completion (Required, Types, Options, Ranking)
    // ==========================================
    console.log("\n--- TEST 3: Complete submission validation rules ---");

    // 3A: Answer references layout content element (should be rejected)
    let contentAnsError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [{ formVersionElementId: contentHeadingId, value: "My answer" }],
      });
    } catch (e: any) {
      contentAnsError = true;
      console.log(`✓ Correctly rejected content layout answer: ${e.message}`);
    }
    if (!contentAnsError) throw new Error("Expected answering content block to fail");

    // 3B: Missing required fields
    let missingReqError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [{ formVersionElementId: q1Id, value: "Alex Smith" }], // Missing Q2, Q4, Q5
      });
    } catch (e: any) {
      missingReqError = true;
      console.log(`✓ Correctly rejected missing required questions: ${e.message}`);
    }
    if (!missingReqError) throw new Error("Expected missing required questions to fail");

    // 3C: Invalid single select option
    let invalidOptionError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [
          { formVersionElementId: q1Id, value: "Alex Smith" },
          { formVersionElementId: q2Id, value: "Bi-Weekly" }, // Not an option!
          { formVersionElementId: q4Id, value: 5 },
          { formVersionElementId: q5Id, value: ["Speed", "Design", "Reliability"] },
        ],
      });
    } catch (e: any) {
      invalidOptionError = true;
      console.log(`✓ Correctly rejected invalid option: ${e.message}`);
    }
    if (!invalidOptionError) throw new Error("Expected invalid choice option to fail");

    // 3D: Out of range star rating
    let invalidRatingError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [
          { formVersionElementId: q1Id, value: "Alex Smith" },
          { formVersionElementId: q2Id, value: "Daily" },
          { formVersionElementId: q4Id, value: 10 }, // Max is 5!
          { formVersionElementId: q5Id, value: ["Speed", "Design", "Reliability"] },
        ],
      });
    } catch (e: any) {
      invalidRatingError = true;
      console.log(`✓ Correctly rejected out-of-range rating: ${e.message}`);
    }
    if (!invalidRatingError) throw new Error("Expected out-of-range rating to fail");

    // 3E: Duplicate items in ranking
    let duplicateRankingError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [
          { formVersionElementId: q1Id, value: "Alex Smith" },
          { formVersionElementId: q2Id, value: "Daily" },
          { formVersionElementId: q4Id, value: 5 },
          { formVersionElementId: q5Id, value: ["Speed", "Speed", "Design"] }, // Duplicate Speed!
        ],
      });
    } catch (e: any) {
      duplicateRankingError = true;
      console.log(`✓ Correctly rejected duplicate ranking items: ${e.message}`);
    }
    if (!duplicateRankingError) throw new Error("Expected duplicate ranking items to fail");

    // 3F: Duplicate answers for the same question
    let duplicateAnswerError = false;
    try {
      await submissionService.completeSubmission({
        submissionId: testAttemptToken,
        answers: [
          { formVersionElementId: q1Id, value: "Alex Smith" },
          { formVersionElementId: q1Id, value: "Alex Second Name" }, // Duplicate!
          { formVersionElementId: q2Id, value: "Daily" },
          { formVersionElementId: q4Id, value: 5 },
          { formVersionElementId: q5Id, value: ["Speed", "Design", "Reliability"] },
        ],
      });
    } catch (e: any) {
      duplicateAnswerError = true;
      console.log(`✓ Correctly rejected duplicate answer entries: ${e.message}`);
    }
    if (!duplicateAnswerError) throw new Error("Expected duplicate answer entries to fail");

    // ==========================================
    // TEST 4: Successful Submission Completion
    // ==========================================
    console.log("\n--- TEST 4: Completing a valid submission ---");
    const completeResult = await submissionService.completeSubmission({
      submissionId: testAttemptToken,
      answers: [
        { formVersionElementId: q1Id, value: "Alex Smith" },
        { formVersionElementId: q2Id, value: "Daily" },
        { formVersionElementId: q3Id, value: "Loving the new versioning system!" },
        { formVersionElementId: q4Id, value: 5 },
        { formVersionElementId: q5Id, value: ["Reliability", "Speed", "Design"] },
      ],
    });

    if (!completeResult.success || !completeResult.submittedAt) {
      throw new Error("Expected completeSubmission to succeed with timestamp");
    }
    console.log(`✓ Submission completed at: ${completeResult.submittedAt.toISOString()} (Duration: ${completeResult.completionDurationMs}ms)`);

    // Verify retry of completed submission returns alreadyCompleted
    const retryComplete = await submissionService.completeSubmission({
      submissionId: testAttemptToken,
      answers: [],
    });
    if (!retryComplete.alreadyCompleted) {
      throw new Error("Expected alreadyCompleted: true on retry");
    }
    console.log(`✓ Retrying complete submission safely returned alreadyCompleted: true`);

    // Verify row count in database
    const { rows: answerRows } = await client.query(
      `SELECT count(*) FROM form_answers WHERE submission_id = $1`,
      [testAttemptToken]
    );
    if (Number(answerRows[0].count) !== 5) {
      throw new Error(`Expected 5 answer rows in form_answers, found: ${answerRows[0].count}`);
    }
    console.log(`✓ Exactly 5 answer rows persisted in PostgreSQL form_answers table`);

    // ==========================================
    // TEST 5: Creator-Facing Read & Ownership Authorization
    // ==========================================
    console.log("\n--- TEST 5: Creator reads & security authorization ---");

    // 5A: Creator reads submission details
    const submissionDetail = await submissionService.getSubmissionById(
      { submissionId: testAttemptToken },
      creatorId
    );
    if (submissionDetail.id !== testAttemptToken || submissionDetail.answers.length !== 5) {
      throw new Error("Submission detail does not match persisted answers");
    }
    console.log(`✓ Creator successfully retrieved submission details with ${submissionDetail.answers.length} answers`);
    console.log(`  Metadata: Browser=${submissionDetail.browserName} (${submissionDetail.browserVersion}), OS=${submissionDetail.osName}, Country=${submissionDetail.countryCode}`);

    // 5B: Unauthorized user attempting to read submission
    let caughtAuthError = false;
    try {
      await submissionService.getSubmissionById(
        { submissionId: testAttemptToken },
        otherUserId
      );
    } catch (e: any) {
      caughtAuthError = true;
      console.log(`✓ Correctly blocked unauthorized user: ${e.message}`);
    }
    if (!caughtAuthError) throw new Error("Expected unauthorized user access to fail");

    // 5C: List submissions for form
    const listResult = await submissionService.listSubmissionsByFormId(
      { formId: testFormId, page: 1, limit: 10 },
      creatorId
    );
    if (listResult.totalCount !== 1 || listResult.items[0].id !== testAttemptToken) {
      throw new Error(`Expected 1 completed submission in list, got ${listResult.totalCount}`);
    }
    console.log(`✓ Listed submissions for form: found ${listResult.totalCount} completed response`);

    // 5D: Aggregated statistics
    const statsResult = await submissionService.getSubmissionStatsByFormId(
      { formId: testFormId },
      creatorId
    );
    if (statsResult.totalCompleted !== 1 || statsResult.completionRate !== 1) {
      throw new Error(`Unexpected stats result: ${JSON.stringify(statsResult)}`);
    }
    console.log(`✓ Aggregated stats calculated: totalCompleted=${statsResult.totalCompleted}, rate=${statsResult.completionRate * 100}%`);
    console.log(`  Device breakdown: ${JSON.stringify(statsResult.deviceBreakdown)}`);

    // ==========================================
    // TEST 6: CRITICAL VERSION INTEGRITY SCENARIO
    // 1. Respondent starts attempt against Version 1
    // 2. Creator updates form and publishes Version 2
    // 3. Respondent completes Version 1 attempt
    // 4. Verify Attempt is tied to Version 1, answers to Version 1 elements
    // ==========================================
    console.log("\n--- TEST 6: Critical Version Integrity Scenario ---");

    // Respondent starts attempt B while form is still Version 1
    const attemptBId = crypto.randomUUID();
    const attemptBStart = await submissionService.startSubmission({
      shareId,
      clientAttemptId: attemptBId,
    });
    if (attemptBStart.formVersionId !== v1Id) {
      throw new Error(`Attempt B should be tied to Version 1 (${v1Id}), got ${attemptBStart.formVersionId}`);
    }
    console.log(`✓ Respondent started attempt B against Version 1 (${v1Id})`);

    // Now creator modifies form and publishes Version 2 via saveFormDraft
    console.log("Creator saves new draft on published form, generating Version 2...");
    const currentFields = await formFieldService.listFormFields(creatorId, testFormId);
    const v2Fields = [
      ...currentFields.map((f) => ({
        id: f.id,
        kind: f.kind,
        type: f.type,
        label: f.label,
        content: f.content,
        required: f.required,
        sortOrder: f.sortOrder,
        config: f.config,
        validationRules: f.validationRules,
      })),
      {
        kind: "question" as const,
        type: "short_text" as const,
        label: "New Question in Version 2",
        required: true,
        sortOrder: 6,
        config: {},
        validationRules: {},
      },
    ];

    const draftResult = await formService.saveFormDraft(creatorId, {
      formId: testFormId,
      title: "Submission Verification Form - Updated V2",
      fields: v2Fields,
    });

    v2Id = draftResult.version.id;
    if (v2Id === v1Id) {
      throw new Error("Expected new published version ID for V2");
    }
    console.log(`✓ Creator generated Version 2 (${v2Id}, vNum: ${draftResult.version.versionNumber}). Form publishedVersionId is now V2.`);

    // Respondent (who was already filling Version 1) now completes Attempt B!
    console.log("Respondent completes Attempt B (started on V1)...");
    const completeAttemptB = await submissionService.completeSubmission({
      submissionId: attemptBId,
      answers: [
        { formVersionElementId: q1Id, value: "Bob Jones" },
        { formVersionElementId: q2Id, value: "Weekly" },
        { formVersionElementId: q4Id, value: 4 },
        { formVersionElementId: q5Id, value: ["Speed", "Reliability", "Design"] },
      ],
    });

    if (!completeAttemptB.success) {
      throw new Error("Attempt B failed to complete!");
    }

    // Verify in database: Attempt B MUST be associated with Version 1, NOT Version 2!
    const { rows: subBRows } = await client.query(
      `SELECT form_version_id FROM form_submissions WHERE id = $1`,
      [attemptBId]
    );
    if (subBRows[0].form_version_id !== v1Id) {
      throw new Error(`CRITICAL: Attempt B version changed to ${subBRows[0].form_version_id}, expected immutable V1 (${v1Id})`);
    }

    // Verify all answers for Attempt B reference Version 1 elements
    const { rows: ansBRows } = await client.query(
      `SELECT form_version_id, form_version_element_id FROM form_answers WHERE submission_id = $1`,
      [attemptBId]
    );
    for (const ansRow of ansBRows) {
      if (ansRow.form_version_id !== v1Id) {
        throw new Error(`Answer referenced version ${ansRow.form_version_id}, expected V1 (${v1Id})`);
      }
    }
    console.log(`✓ PERFECT VERSION INTEGRITY: Submission ${attemptBId} and all ${ansBRows.length} answers remain permanently tied to Version 1 (${v1Id})!`);

    // ==========================================
    // TEST 7: Submission Limit Concurrency Safety
    // ==========================================
    console.log("\n--- TEST 7: Submission Limits Enforced Safely ---");
    // Set maxSubmissions = 2 (we already have 2 completed submissions)
    await formService.updateForm(creatorId, testFormId, {
      maxSubmissions: 2,
    });
    console.log(`✓ Form maxSubmissions set to 2 (current completed: 2)`);

    // Starting a new attempt should be blocked
    let limitBlockOnStart = false;
    try {
      await submissionService.startSubmission({ shareId });
    } catch (e: any) {
      limitBlockOnStart = true;
      console.log(`✓ startSubmission correctly blocked at limit: ${e.message}`);
    }
    if (!limitBlockOnStart) throw new Error("Expected startSubmission to be blocked at limit");

    // If an in-progress attempt already existed, completing it should also be blocked at limit
    // Create an in-progress attempt manually before limit was reached:
    const attemptCId = crypto.randomUUID();
    await client.query(
      `INSERT INTO form_submissions (id, form_id, form_version_id, started_at, submitted_at) VALUES ($1, $2, $3, NOW(), NULL)`,
      [attemptCId, testFormId, v2Id]
    );

    let limitBlockOnComplete = false;
    try {
      await submissionService.completeSubmission({
        submissionId: attemptCId,
        answers: [
          { formVersionElementId: q1Id, value: "Exceeded User" },
          { formVersionElementId: q2Id, value: "Monthly" },
          { formVersionElementId: q4Id, value: 3 },
          { formVersionElementId: q5Id, value: ["Design", "Speed", "Reliability"] },
        ],
      });
    } catch (e: any) {
      limitBlockOnComplete = true;
      console.log(`✓ completeSubmission correctly blocked at limit: ${e.message}`);
    }
    if (!limitBlockOnComplete) throw new Error("Expected completeSubmission to be blocked at limit");

    console.log("\n=======================================================");
    console.log("🎉 ALL SUBMISSION SYSTEM E2E TESTS PASSED WITH 100% SUCCESS!");
    console.log("=======================================================");
  } finally {
    // Clean up test form and test submissions
    if (testFormId) {
      console.log("\n--- CLEANUP: Removing test form and cascaded records ---");
      await client.query(`DELETE FROM form_answers WHERE form_version_id IN (SELECT id FROM form_versions WHERE form_id = $1)`, [testFormId]);
      await client.query(`DELETE FROM form_submissions WHERE form_id = $1`, [testFormId]);
      await client.query(`DELETE FROM forms WHERE id = $1`, [testFormId]);
      console.log(`✓ Test form ${testFormId} cleaned up`);
    }
    await client.end();
  }
}

runSubmissionVerification().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
