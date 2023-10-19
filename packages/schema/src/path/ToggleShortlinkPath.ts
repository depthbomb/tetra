import { z } from 'zod';
import { Shortcode } from '../Shortcode';

export const ToggleShortlinkPath = z.object({
	shortcode: Shortcode,
}).strict();
