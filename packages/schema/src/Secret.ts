import { z } from 'zod';

export const Secret = z.string().length(64).regex(/^[a-zA-Z0-9_-]{64}$/);
