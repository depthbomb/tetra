import { z } from 'zod';
import { ApiKey } from '../ApiKey';

export const ListUsersQuery = z.object({
	apiKey: ApiKey
});
