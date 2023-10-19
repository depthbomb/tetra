import { z } from 'zod';

export const ShortlinkInfoResponse = z.object({
	shortlink: z.string().url(),
	destination: z.string().url(),
	hits: z.number().min(0),
	createdAt: z.date(),
	expiresAt: z.date().optional(),
}).strict();
