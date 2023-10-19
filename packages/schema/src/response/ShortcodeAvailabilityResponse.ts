import { z } from 'zod';

export const ShortcodeAvailabilityResponse = z.object({
	available: z.boolean()
}).strict();
