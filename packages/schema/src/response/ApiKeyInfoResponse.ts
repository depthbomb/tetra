import { z } from 'zod';

export const ApiKeyInfoResponse = z.object({
	canRegenerate: z.boolean(),
	nextApiKeyAvailable: z.date()
}).strict();
