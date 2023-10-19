import { z } from 'zod';

export const CountShortlinksResponse = z.object({
	count: z.number().min(0)
}).strict();
