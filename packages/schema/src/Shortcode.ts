import { z } from 'zod';

export const Shortcode = z.string().min(3).max(64).regex(/^[a-zA-Z0-9_-]{3,64}$/);

export const ExpandableShortcode = z.string().min(3).max(65).regex(/^[a-zA-Z0-9_-]{3,64}(\+)?$/);
