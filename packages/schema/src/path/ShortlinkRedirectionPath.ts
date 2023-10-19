import { z } from 'zod';
import { ExpandableShortcode } from '../Shortcode';

export const ShortlinkRedirectionPath = z.object({
	shortcode: ExpandableShortcode
});
