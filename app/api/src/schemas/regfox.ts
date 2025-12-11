import z from 'zod';

const nameFieldSchema = z.object({
  type: z.literal('name'),
  key: z.string(),
  label: z.string(),
  first: z.object({
    label: z.string(),
    type: z.literal('nameField'),
    value: z.string(),
  }),
  last: z.object({
    label: z.string(),
    type: z.literal('nameField'),
    value: z.string(),
  }),
});

const emailFieldSchema = z.object({
  type: z.literal('email'),
  key: z.string(),
  label: z.string(),
  value: z.email(),
});

const textFieldSchema = z.object({
  type: z.literal('textField'),
  key: z.string(),
  label: z.string(),
  value: z.string(),
});

const genericFieldSchema = z.looseObject({
  type: z.string(),
  key: z.string(),
  label: z.string(),
});

const registrantDataFieldSchema = z.union([
  nameFieldSchema,
  emailFieldSchema,
  textFieldSchema,
  genericFieldSchema,
]);

const registrantSchema = z.object({
  id: z.string(),
  lookupId: z.number(),
  amount: z.number(),
  data: z.array(registrantDataFieldSchema),
});

export const regFoxWebhookPayloadSchema = z.object({
  eventType: z.string(),
  accountId: z.number(),
  formId: z.number(),
  eventId: z.number(),
  data: z.looseObject({
    customerId: z.number(),
    formName: z.string(),
    id: z.string(),
    orderNumber: z.string(),
    orderStatus: z.string(),
    registrationTimestamp: z.iso.datetime(),
    registrants: z.array(registrantSchema),
  }),
  meta: z.object({
    appKey: z.string(),
    appToken: z.string(),
    name: z.string(),
  }),
});

// Helper type to extract registrant details
export type RegFoxWebhookPayload = z.infer<typeof regFoxWebhookPayloadSchema>;
export type RegFoxRegistrantPayload = z.infer<typeof registrantSchema>;
export type NameField = z.infer<typeof nameFieldSchema>;
export type EmailField = z.infer<typeof emailFieldSchema>;
export type AgaField = z.infer<typeof textFieldSchema>;

export interface RegistrantDetails {
  firstName: string;
  lastName: string;
  email: string;
  aga: string | null;
}
