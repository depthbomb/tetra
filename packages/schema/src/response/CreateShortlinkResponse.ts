import { z } from 'zod';
import { Secret } from '../Secret';
import { Shortcode } from '../Shortcode';

export const CreateShortlinkResponse = z.object({
	shortcode: Shortcode,
	shortlink: z.string().url(),
	destination: z.string().url(),
	secret: Secret,
	expiresAt: z.date().optional()
}).strict();
