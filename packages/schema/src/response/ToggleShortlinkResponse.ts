import { z } from 'zod';

export const ToggleShortlinkResponse = z.object({
	disabled: z.boolean(),
}).strict();
