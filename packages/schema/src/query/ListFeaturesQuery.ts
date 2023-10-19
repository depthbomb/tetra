import { z } from 'zod';
import { ApiKey } from '../ApiKey';

export const ListFeaturesQuery = z.object({
	apiKey: ApiKey
});
