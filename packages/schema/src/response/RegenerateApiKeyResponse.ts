import { z } from 'zod';
import { ApiKey } from '../ApiKey';

export const RegenerateApiKeyResponse = z.object({
	apiKey: ApiKey,
}).strict();
