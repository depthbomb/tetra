import { z } from 'zod';

export const FeatureName = z.string().min(1).regex(/^[A-Z0-9_]{1,}$/);
