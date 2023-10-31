import { z } from 'zod';
import { Task } from '../Task';

export const ListTasksResponse = z.array(Task);
