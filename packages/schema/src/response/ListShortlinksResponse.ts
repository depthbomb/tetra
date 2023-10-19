import { z } from 'zod';
import { Secret } from '../Secret';
import { Shortcode } from '../Shortcode';

export const ListShortlinksItem = z.object({
	shortcode: Shortcode,
	shortlink: z.string().url(),
	destination: z.string().url(),
	secret: Secret,
	hits: z.number().min(0),
	createdAt: z.date(),
	expiresAt: z.date().optional()
}).strict();
export const ListShortlinksResponse = z.array(ListShortlinksItem);
