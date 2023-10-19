import { z } from 'zod';

export const AppVersionResponse = z.object({
	hash: z.string().length(7).regex(/^[a-f0-9]{7}$/)
}).strict();
