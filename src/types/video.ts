import { z } from 'zod';

export const PlayResponseSchema = z.object({
  url: z.string().url(),
  loop: z.boolean(),
});

export type PlayResponseType = z.infer<typeof PlayResponseSchema>;
