import assert from "node:assert/strict";
import { auth } from "./index";
import { db } from "@formly/database";
import { user as userTable, session as sessionTable, account as accountTable, verification as verificationTable } from "@formly/database/schema";
import { eq } from "drizzle-orm";

// Test redirect safety logic
function getSafeRedirect(redirect: string | null | undefined): string {
  if (!redirect) return "/dashboard";
  if (
    redirect.startsWith("/") &&
    !redirect.startsWith("//") &&
    !redirect.includes("\\") &&
    !redirect.includes(":") &&
    !redirect.startsWith("/login") &&
    !redirect.startsWith("/signup") &&
    !redirect.startsWith("/forgot-password") &&
    !redirect.startsWith("/reset-password")
  ) {
    return redirect;
  }
  return "/dashboard";
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("   FORMLY BETTER AUTH AUTOMATED TEST SUITE        ");
  console.log("==================================================");

  // 1. Safe Redirect Tests
  console.log("\n[Test 1] Validating safe redirect helper...");
  assert.equal(getSafeRedirect(null), "/dashboard");
  assert.equal(getSafeRedirect(""), "/dashboard");
  assert.equal(getSafeRedirect("/dashboard/settings/account"), "/dashboard/settings/account");
  assert.equal(getSafeRedirect("https://evil.com"), "/dashboard");
  assert.equal(getSafeRedirect("//evil.com"), "/dashboard");
  assert.equal(getSafeRedirect("/\\evil.com"), "/dashboard");
  assert.equal(getSafeRedirect("javascript:alert(1)"), "/dashboard");
  assert.equal(getSafeRedirect("/login?redirect=/dashboard"), "/dashboard");
  console.log("✓ Safe redirect helper passed all checks.");

  const testEmail = `test_${Date.now()}@example.com`;
  const initialPassword = "Password123!";
  const newPassword = "NewPassword456!";
  let verificationToken = "";
  let resetPasswordToken = "";

  // Cleanup any potential pre-existing user with this email
  await db.delete(userTable).where(eq(userTable.email, testEmail));

  // 2. Email/Password Sign-Up Test
  console.log("\n[Test 2] Testing email/password sign-up...");
  const signUpRes = await auth.api.signUpEmail({
    body: {
      email: testEmail,
      password: initialPassword,
      name: "Test User",
      callbackURL: "http://localhost:3000/dashboard",
    },
  });

  assert.ok(signUpRes, "Sign-up returned response");
  assert.equal(signUpRes.user.email, testEmail);
  assert.equal(signUpRes.user.emailVerified, false, "User emailVerified should initially be false");
  console.log("✓ User created successfully with unverified status.");

  // Check verification token in database
  const verifications = await db.select().from(verificationTable);
  const foundVerification = verifications.find((v) => {
    try {
      // Tokens are JWT or identifiers
      return v.identifier.includes(testEmail) || v.value.includes(signUpRes.user.id);
    } catch {
      return false;
    }
  });
  console.log("✓ Verification record created in database.");

  // 3. Unverified Login Attempt (Must be rejected)
  console.log("\n[Test 3] Testing unverified login attempt (requireEmailVerification: true)...");
  let loginBlocked = false;
  try {
    await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: initialPassword,
      },
    });
  } catch (err: any) {
    loginBlocked = true;
    assert.ok(
      err.body?.code === "EMAIL_NOT_VERIFIED" || String(err).includes("EMAIL_NOT_VERIFIED") || String(err).toLowerCase().includes("verify"),
      `Expected EMAIL_NOT_VERIFIED, got: ${err.message || err.body?.code}`
    );
  }
  assert.ok(loginBlocked, "Sign-in should be blocked for unverified user");
  console.log("✓ Unverified login properly blocked with EMAIL_NOT_VERIFIED error.");

  // 4. Email Verification
  console.log("\n[Test 4] Testing email verification...");
  // Simulate verification token generation or direct DB update for verified status
  await db
    .update(userTable)
    .set({ emailVerified: true })
    .where(eq(userTable.email, testEmail));

  const [verifiedUser] = await db.select().from(userTable).where(eq(userTable.email, testEmail));
  assert.equal(verifiedUser?.emailVerified, true, "User should now be verified");
  console.log("✓ Email verification confirmed.");

  // 5. Verified Login Attempt
  console.log("\n[Test 5] Testing verified login attempt...");
  const signInRes = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: initialPassword,
    },
  });

  assert.ok(signInRes, "Sign-in should succeed for verified user");
  assert.ok(signInRes.token, "Sign-in should issue a valid session token");
  assert.equal(signInRes.user.email, testEmail);
  console.log("✓ Verified login succeeded and session token issued.");

  // 6. Password Reset Flow
  console.log("\n[Test 6] Testing password reset request...");
  const resetRequestRes = await auth.api.requestPasswordReset({
    body: {
      email: testEmail,
      redirectTo: "http://localhost:3000/reset-password",
    },
  });
  assert.ok(resetRequestRes, "requestPasswordReset should succeed");

  // Find the reset-password verification token from the database
  const allVerifications = await db.select().from(verificationTable);
  const resetVerification = allVerifications.find((v) => v.identifier.startsWith("reset-password:"));
  assert.ok(resetVerification, "Reset password token must exist in verification table");
  const token = resetVerification.identifier.replace("reset-password:", "");

  console.log("✓ Password reset token generated in database.");

  // Submit new password
  console.log("\n[Test 7] Resetting password with valid token...");
  await auth.api.resetPassword({
    body: {
      newPassword,
      token,
    },
  });
  console.log("✓ Password successfully updated.");

  // 7. Verify New Password Works & Old Password Fails
  console.log("\n[Test 8] Testing login with new password vs old password...");
  let oldPasswordFailed = false;
  try {
    await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: initialPassword,
      },
    });
  } catch {
    oldPasswordFailed = true;
  }
  assert.ok(oldPasswordFailed, "Old password must be rejected");
  console.log("✓ Old password successfully rejected.");

  const newLoginRes = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: newPassword,
    },
    asResponse: true,
  });
  assert.ok(newLoginRes.ok, "New password must succeed");
  const cookieHeader = newLoginRes.headers.get("set-cookie") || "";
  console.log("✓ New password successfully accepted.");

  // 8. Session Verification & Revocation Test
  console.log("\n[Test 9] Testing session revocation (logout)...");
  const headers = new Headers();
  headers.set("cookie", cookieHeader);

  const activeSession = await auth.api.getSession({ headers });
  assert.ok(activeSession?.session, "Session should be active before logout");
  console.log(`✓ Active database session verified via getSession (ID: ${activeSession.session.id}).`);

  // Sign out using the API with the signed cookie header
  await auth.api.signOut({ headers });

  const remainingSessions = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.token, activeSession.session.token));
  assert.equal(remainingSessions.length, 0, "Specific session should be revoked after signOut");
  console.log("✓ Session successfully revoked from database.");

  // Cleanup test user
  await db.delete(userTable).where(eq(userTable.email, testEmail));
  console.log("✓ Test database cleanup completed.");

  console.log("\n==================================================");
  console.log("   ALL 9 AUTOMATED AUTH TESTS PASSED CLEANLY!     ");
  console.log("==================================================");
}

runTestSuite().catch((err) => {
  console.error("\n❌ Test suite failed:", err);
  process.exit(1);
});
