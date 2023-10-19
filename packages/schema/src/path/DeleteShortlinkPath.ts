import { z } from 'zod';
import { ShortcodePath } from './ShortcodePath';

export const DeleteShortlinkPath = ShortcodePath.extend({
	secret: z.string().length(64).regex(/[a-zA-Z0-9]{64}/)
});
