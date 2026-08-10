import { z } from 'zod';

export const speciesEnum = z.enum(['dog', 'cat', 'other']);
export const sizeEnum = z.enum(['small', 'medium', 'large']);
export const contactPrefEnum = z.enum(['in_app', 'phone', 'email']);
export const speciesFilterEnum = z.enum(['dogs', 'cats', 'all']);

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string().optional(),
});

export const missingReportSchema = z.object({
  name: z.string().min(1, 'What is your pet called?').max(60),
  species: speciesEnum,
  breed: z.string().max(80).optional().or(z.literal('')),
  colour: z.string().min(1, 'Add a colour so neighbours can spot them').max(60),
  age: z.string().max(40).optional().or(z.literal('')),
  size: sizeEnum,
  description: z.string().max(600).optional().or(z.literal('')),
  photoUrl: z.preprocess(
    (v) => v ?? '',
    z.string().min(1, 'Add a photo so neighbours can recognise them.'),
  ),
  lastSeenDate: z.string().min(1, 'When did you last see them?'),
  lastSeenTime: z.string().min(1, 'What time?'),
  location: geoPointSchema.nullish().refine((v) => v != null, 'Mark where they were last seen'),
  alertRadiusKm: z.number().min(1).max(10),
  contactPref: contactPrefEnum,
  contactValue: z.string().max(120).optional().or(z.literal('')),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please agree to the terms to publish.',
  }),
}).superRefine((data, ctx) => {
  if (data.contactPref !== 'in_app' && !data.contactValue?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['contactValue'],
      message:
        data.contactPref === 'phone'
          ? 'Add a phone number, or choose "Sightings only".'
          : 'Add an email, or choose "Sightings only".',
    });
  }
});

export type MissingReportForm = z.infer<typeof missingReportSchema>;

export const foundReportSchema = z.object({
  species: speciesEnum,
  breed: z.string().max(80).optional().or(z.literal('')),
  colour: z.string().min(1, 'Add a colour to help match this pet').max(60),
  size: sizeEnum,
  photoUrl: z.string().nullable().optional(),
  foundDate: z.string().min(1, 'When did you find them?'),
  foundTime: z.string().min(1, 'What time?'),
  location: geoPointSchema.nullish().refine((v) => v != null, 'Mark where you found them'),
  stillHasPet: z.boolean(),
  notes: z.string().max(600).optional().or(z.literal('')),
  contactPref: contactPrefEnum,
  contactValue: z.string().max(120).optional().or(z.literal('')),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please agree to the terms to publish.',
  }),
}).superRefine((data, ctx) => {
  if (data.contactPref !== 'in_app' && !data.contactValue?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['contactValue'],
      message:
        data.contactPref === 'phone'
          ? 'Add a phone number, or choose "Sightings only".'
          : 'Add an email, or choose "Sightings only".',
    });
  }
});

export type FoundReportForm = z.infer<typeof foundReportSchema>;

export const sightingSchema = z.object({
  seenDate: z.string().min(1, 'When did you see them?'),
  seenTime: z.string().min(1, 'What time?'),
  location: geoPointSchema.nullish(),
  photoUrl: z.string().nullable().optional(),
  notes: z.string().max(400).optional().or(z.literal('')),
});

export type SightingForm = z.infer<typeof sightingSchema>;

export const areaSchema = z.object({
  label: z.string().min(1, 'Give this area a name').max(40),
  location: geoPointSchema.nullish().refine((v) => v != null, 'Choose a location'),
  radiusKm: z.number().min(1).max(10),
  speciesFilter: speciesFilterEnum,
});

export type AreaForm = z.infer<typeof areaSchema>;
