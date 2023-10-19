import { z } from 'zod';

export const ToggleFeatureResponse = z.object({
	old: z.boolean(),
	new: z.boolean(),
}).strict();
