import { z } from 'zod';
import { Shortcode } from '../Shortcode';

export const ShortcodePath = z.object({
	shortcode: Shortcode,
}).strict();
