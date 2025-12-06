import { runtime } from '@/config';
import type { Context } from '@/types';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  fileblob: string; // Base64 encoded file content
  mimetype: string;
}

export interface SendEmailParams {
  to: EmailRecipient[];
  from?: EmailRecipient;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  attachments?: EmailAttachment[];
  customHeaders?: Array<{ header: string; value: string }>;
}

export interface SMTP2GoResponse {
  data: {
    succeeded: number;
    failed: number;
    failures?: Array<{
      index: number;
      error: string;
      error_code: string;
    }>;
  };
}

/**
 * Send an email using the SMTP2Go API
 * Documentation: https://apidoc.smtp2go.com/documentation/#/README
 */
export async function sendEmail(
  context: Context,
  params: SendEmailParams,
): Promise<SMTP2GoResponse> {
  const {
    to,
    from = {
      email: runtime.smtp.fromEmail,
      name: runtime.smtp.fromName,
    },
    subject,
    htmlBody,
    textBody,
    cc,
    bcc,
    attachments,
    customHeaders,
  } = params;

  if (!runtime.smtp.apiKey) {
    throw new Error('SMTP2Go API key is not configured');
  }

  if (!htmlBody && !textBody) {
    throw new Error('Either htmlBody or textBody must be provided');
  }

  // Build the request payload according to SMTP2Go API spec
  const payload: Record<string, unknown> = {
    to: to.map((recipient) =>
      recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
    ),
    sender: from.name ? `${from.name} <${from.email}>` : from.email,
    subject,
  };

  if (htmlBody) {
    payload.html_body = htmlBody;
  }

  if (textBody) {
    payload.text_body = textBody;
  }

  if (cc && cc.length > 0) {
    payload.cc = cc.map((recipient) =>
      recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
    );
  }

  if (bcc && bcc.length > 0) {
    payload.bcc = bcc.map((recipient) =>
      recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email,
    );
  }

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments;
  }

  if (customHeaders && customHeaders.length > 0) {
    payload.custom_headers = customHeaders;
  }

  context.logger.info(
    {
      to: to.map((r) => r.email),
      subject,
    },
    'Sending email via SMTP2Go',
  );

  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': runtime.smtp.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      context.logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          error: errorJson.data,
        },
        'SMTP2Go API request failed',
      );
      throw new Error(
        `SMTP2Go API request failed: ${response.status} ${response.statusText} : ${JSON.stringify(errorJson.data)}`,
      );
    }

    const result = (await response.json()) as SMTP2GoResponse;

    if (result.data.failed > 0) {
      context.logger.warn(
        {
          failures: result.data.failures,
        },
        'Some emails failed to send',
      );
    }

    context.logger.info(
      {
        succeeded: result.data.succeeded,
        failed: result.data.failed,
      },
      'Email sent successfully',
    );

    return result;
  } catch (error) {
    context.logger.error(
      {
        error,
      },
      'Error sending email',
    );
    throw error;
  }
}

/**
 * Utility function to send a simple text email
 */
export async function sendTextEmail(
  context: Context,
  to: string | EmailRecipient,
  subject: string,
  textBody: string,
): Promise<SMTP2GoResponse> {
  const recipient: EmailRecipient = typeof to === 'string' ? { email: to } : to;
  return sendEmail(context, {
    to: [recipient],
    subject,
    textBody,
  });
}

/**
 * Utility function to send a simple HTML email
 */
export async function sendHtmlEmail(
  context: Context,
  to: string | EmailRecipient,
  subject: string,
  htmlBody: string,
): Promise<SMTP2GoResponse> {
  const recipient: EmailRecipient = typeof to === 'string' ? { email: to } : to;
  return sendEmail(context, {
    to: [recipient],
    subject,
    htmlBody,
  });
}

/**
 * Generates a styled HTML email template for one-time password delivery
 */
export function generateOtpEmailHtml(
  otpCode: string,
  supportEmail: string = 'support@gocongress.org',
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      color: #333333;
      font-size: 16px;
      margin: 0 0 20px 0;
    }
    .otp-container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      color: #000;
      letter-spacing: 8px;
      font-family: 'Courier New', Courier, monospace;
      margin: 10px 0;
      user-select: all;
    }
    .info-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .warning-box {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 0;
      color: #721c24;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      color: #6c757d;
      font-size: 14px;
      margin: 5px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .container {
        margin: 20px;
        border-radius: 4px;
      }
      .header {
        padding: 30px 20px;
      }
      .header h1 {
        font-size: 24px;
      }
      .content {
        padding: 30px 20px;
      }
      .otp-code {
        font-size: 28px;
        letter-spacing: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Enter this code on the login page to access your account:</p>

      <div class="otp-container">
        <div class="otp-code">${otpCode}</div>
      </div>

      <div class="info-box">
        <p><strong>⏱️ Important:</strong> This password will expire in 15 minutes and can only be used once.</p>
      </div>

      <div class="warning-box">
        <p><strong>⚠️ Did not request this code?</strong> If you did not request this one-time password, please ignore this email or contact our support team for help at <a href="mailto:${supportEmail}" style="color: #721c24; font-weight: 600;">${supportEmail}</a></p>
      </div>
    </div>
    <div class="footer">
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} AGA Prizes. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends a one-time password email with a styled HTML template
 */
export async function sendOtpEmail(
  context: Context,
  to: string | EmailRecipient,
  otpCode: string,
  supportEmail: string = 'support@gocongress.org',
): Promise<SMTP2GoResponse | void> {
  if (!context.runtime.smtp.enabled) {
    context.logger.warn('SMTP is not enabled, skipping sending OTP email');
    return;
  }
  const htmlBody = generateOtpEmailHtml(otpCode, supportEmail);
  return sendHtmlEmail(context, to, `Verification code: ${otpCode}`, htmlBody);
}
