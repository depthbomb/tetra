import { z } from 'zod';

export const SetShortlinkExpiryResponse = z.object({
	expiresAt: z.date()
}).strict();
