import { z } from 'zod';

export const ListFeaturesItem = z.object({
	name: z.string(),
	enabled: z.boolean()
}).strict();
export const ListFeaturesResponse = ListFeaturesItem.array();
