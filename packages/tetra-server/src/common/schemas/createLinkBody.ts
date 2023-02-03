import { z } from 'zod';

export const CreateLinkBody = z.object({
	destination: z.string().url(),
	duration: z.string().nullable(),
	expiresAt: z.date().nullable()
});
