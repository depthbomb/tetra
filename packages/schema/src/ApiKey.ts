import { z } from 'zod';

export const ApiKey = z.string().length(64).regex(/^[a-fA-F0-9]{64}$/);
