import { z } from 'zod';
import { ListShortlinksItem } from './ListShortlinksResponse';

export const ListAllShortlinksItem = ListShortlinksItem.extend({
	creatorIp: z.string().ip(),
	disabled: z.boolean(),
	user: z.object({
		username: z.string()
	}).optional()
}).strict();
export const ListAllShortlinksResponse = z.array(ListAllShortlinksItem);
