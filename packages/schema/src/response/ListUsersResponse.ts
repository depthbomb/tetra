import { z } from 'zod';

export const ListUsersItem = z.object({
	username: z.string(),
	avatar: z.string().url(),
	admin: z.boolean().default(false)
}).strict();
export const ListUsersResponse = z.array(ListUsersItem);
