import { z } from 'zod';

export const SetShortlinkExpiryBody = z.object({
	duration: z.string(),
}).strict();
