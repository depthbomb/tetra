import { z } from 'zod';

export const Task = z.object({
	name: z.string(),
	description: z.string(),
	immediate: z.boolean().default(false).optional(),
	once: z.boolean().default(false).optional(),
	interval: z.string(),
	nextRun: z.date().optional(),
	lastRun: z.date().optional(),
});
