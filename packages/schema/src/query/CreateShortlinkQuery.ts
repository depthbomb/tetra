import { z } from 'zod';
import { ApiKey } from '../ApiKey';

export const CreateShortlinkQuery = z.object({
	apiKey: ApiKey.optional(),
});
