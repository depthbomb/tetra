import { z } from 'zod';
import { Shortcode } from '../Shortcode';

export const CreateShortlinkBody = z.object({
	destination: z.string().url(),
	shortcode: Shortcode.optional(),
	duration: z.string().optional(),
}).strict();
