import { z } from 'zod';
import { ApiKey } from '../ApiKey';

export const ListShortlinksQuery = z.object({
	apiKey: ApiKey
});
