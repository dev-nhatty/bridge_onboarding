import { z } from 'zod';

export const SUPPORT = ['screenReader', 'captions', 'signLanguage', 'extraTime', 'largeText'];
export const ID_ROUTES = ['kebele', 'refugee', 'other', 'referral'];

// .strict() matters: a draft PATCH that contains `password` (or anything unknown) is rejected,
// so a password can never end up in the drafts table.
export const answersSchema = z
  .object({
    fullName: z.string().trim().max(120).optional(),
    contact: z.string().trim().max(120).optional(),
    idRoute: z.enum(ID_ROUTES).optional(),
    idNumber: z.string().trim().max(60).optional(),
    support: z.array(z.enum(SUPPORT)).max(SUPPORT.length).optional(),
    supportNote: z.string().trim().max(1000).optional(),
  })
  .strict();

export const prefsSchema = {
  lang: z.enum(['en', 'am']).optional(),
  mode: z.enum(['normal', 'simple']).optional(),
};

export const createDraftSchema = z.object(prefsSchema).strict();

export const patchDraftSchema = z
  .object({
    answers: answersSchema,
    stepIndex: z.number().int().min(0).max(20).optional(),
    ...prefsSchema,
  })
  .strict();

export const submitSchema = z.object({ password: z.string().min(8).max(200) }).strict();

export const loginSchema = z
  .object({ identifier: z.string().trim().min(1).max(120), password: z.string().min(1).max(200) })
  .strict();

export const jobSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(120),
    location: z.string().trim().max(120).optional(),
    accommodations: z.array(z.enum(SUPPORT)).max(SUPPORT.length),
  })
  .strict();

export const applySchema = z.object({ answer: z.string().trim().max(2000).optional() }).strict();
