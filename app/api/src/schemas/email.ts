import { z } from 'zod';

export const EmailRecipientSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
});

export const EmailAttachmentSchema = z.object({
  filename: z.string(),
  fileblob: z.string(), // Base64 encoded file content
  mimetype: z.string(),
});

export const EmailCustomHeaderSchema = z.object({
  header: z.string(),
  value: z.string(),
});

export const SendEmailSchema = z
  .object({
    to: z.array(EmailRecipientSchema).min(1),
    from: EmailRecipientSchema.optional(),
    subject: z.string().min(1),
    htmlBody: z.string().optional(),
    textBody: z.string().optional(),
    cc: z.array(EmailRecipientSchema).optional(),
    bcc: z.array(EmailRecipientSchema).optional(),
    attachments: z.array(EmailAttachmentSchema).optional(),
    customHeaders: z.array(EmailCustomHeaderSchema).optional(),
  })
  .refine((data) => data.htmlBody || data.textBody, {
    message: 'Either htmlBody or textBody must be provided',
  });

export const EmailResponseSchema = z.object({
  succeeded: z.number(),
  failed: z.number(),
  failures: z
    .array(
      z.object({
        index: z.number(),
        error: z.string(),
        error_code: z.string(),
      }),
    )
    .optional(),
});

export type EmailRecipient = z.infer<typeof EmailRecipientSchema>;
export type EmailAttachment = z.infer<typeof EmailAttachmentSchema>;
export type EmailCustomHeader = z.infer<typeof EmailCustomHeaderSchema>;
export type SendEmail = z.infer<typeof SendEmailSchema>;
export type EmailResponse = z.infer<typeof EmailResponseSchema>;
