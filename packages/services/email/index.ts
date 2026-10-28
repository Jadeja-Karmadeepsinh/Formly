import nodemailer from "nodemailer";
import { logger } from "@formly/logger";
import { env } from "../env";

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  expiresInMinutes,
}: SendPasswordResetEmailParams): Promise<void> {
  const isSmtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

  // In development without SMTP credentials, print fallback to console
  if (!isSmtpConfigured) {
    if (env.NODE_ENV !== "prod" && env.NODE_ENV !== "production") {
      logger.info(
        `\n==================== [DEV EMAIL FALLBACK] ====================\n` +
          `To: ${to}\n` +
          `Subject: Reset your Formly password\n` +
          `Reset Link: ${resetUrl}\n` +
          `Expires In: ${expiresInMinutes} minutes\n` +
          `==============================================================\n`
      );
      return;
    }

    throw new Error("SMTP server is not configured in production environment.");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587,
    secure: env.SMTP_PORT === "465",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const subject = "Reset your Formly password";

  const textContent = `
Hello,

We received a request to reset the password for your Formly account (${to}).

To set a new password, open the link below in your browser:
${resetUrl}

This link is valid for ${expiresInMinutes} minutes and can only be used once.

If you did not make this request, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The Formly Team
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:40px 16px;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
    <tr>
      <td style="padding:32px 32px 24px 32px;text-align:left;">
        <div style="font-size:18px;font-weight:600;letter-spacing:-0.02em;margin-bottom:20px;color:#171717;">
          Formly
        </div>
        <h1 style="font-size:20px;font-weight:600;line-height:1.3;margin:0 0 12px 0;color:#171717;">
          Reset your password
        </h1>
        <p style="font-size:14px;line-height:1.6;color:#525252;margin:0 0 24px 0;">
          We received a request to reset your password. Click the button below to choose a new password for your account.
        </p>
        <div style="margin:28px 0;">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#171717;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;">
            Reset password
          </a>
        </div>
        <p style="font-size:13px;line-height:1.6;color:#737373;margin:0 0 16px 0;">
          This link will expire in <strong>${expiresInMinutes} minutes</strong> and can only be used once.
        </p>
        <p style="font-size:12px;line-height:1.5;color:#a3a3a3;margin:24px 0 0 0;padding-top:20px;border-top:1px solid #f0f0f0;">
          If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    logger.error("Failed to deliver password reset email via SMTP", {
      to,
      error: error instanceof Error ? error.message : String(error),
    });

    if (env.NODE_ENV !== "prod" && env.NODE_ENV !== "production") {
      logger.info(
        `\n==================== [DEV EMAIL FALLBACK (SMTP Error)] ====================\n` +
          `To: ${to}\n` +
          `Subject: Reset your Formly password\n` +
          `Reset Link: ${resetUrl}\n` +
          `Expires In: ${expiresInMinutes} minutes\n` +
          `===========================================================================\n`
      );
    }
    throw error;
  }
}

interface SendVerificationEmailParams {
  to: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  to,
  verificationUrl,
}: SendVerificationEmailParams): Promise<void> {
  const isSmtpConfigured = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

  // In development without SMTP credentials, print fallback to console
  if (!isSmtpConfigured) {
    if (env.NODE_ENV !== "prod" && env.NODE_ENV !== "production") {
      logger.info(
        `\n==================== [DEV EMAIL FALLBACK] ====================\n` +
          `To: ${to}\n` +
          `Subject: Verify your Formly email\n` +
          `Verification Link: ${verificationUrl}\n` +
          `==============================================================\n`
      );
      return;
    }

    throw new Error("SMTP server is not configured in production environment.");
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587,
    secure: env.SMTP_PORT === "465",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  const subject = "Verify your Formly email address";

  const textContent = `
Hello,

Thank you for registering with Formly! Please verify your email address (${to}) by opening the link below in your browser:
${verificationUrl}

If you did not create an account, you can safely ignore this email.

Best regards,
The Formly Team
`.trim();

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:40px 16px;background-color:#fafaf9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
    <tr>
      <td style="padding:32px 32px 24px 32px;text-align:left;">
        <div style="font-size:18px;font-weight:600;letter-spacing:-0.02em;margin-bottom:20px;color:#171717;">
          Formly
        </div>
        <h1 style="font-size:20px;font-weight:600;line-height:1.3;margin:0 0 12px 0;color:#171717;">
          Verify your email address
        </h1>
        <p style="font-size:14px;line-height:1.6;color:#525252;margin:0 0 24px 0;">
          Welcome to Formly! Please click the button below to verify your email address and activate your account.
        </p>
        <div style="margin:28px 0;">
          <a href="${verificationUrl}" target="_blank" style="display:inline-block;padding:12px 24px;background-color:#171717;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;">
            Verify email
          </a>
        </div>
        <p style="font-size:12px;line-height:1.5;color:#a3a3a3;margin:24px 0 0 0;padding-top:20px;border-top:1px solid #f0f0f0;">
          If you didn't create an account with Formly, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    logger.error("Failed to deliver verification email via SMTP", {
      to,
      error: error instanceof Error ? error.message : String(error),
    });

    if (env.NODE_ENV !== "prod" && env.NODE_ENV !== "production") {
      logger.info(
        `\n==================== [DEV EMAIL FALLBACK (SMTP Error)] ====================\n` +
          `To: ${to}\n` +
          `Subject: Verify your Formly email\n` +
          `Verification Link: ${verificationUrl}\n` +
          `===========================================================================\n`
      );
    }
    throw error;
  }
}