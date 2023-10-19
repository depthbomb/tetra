import { z } from 'zod';
import { FeatureName } from '../FeatureName';

export const ToggleFeaturePath = z.object({
	name: FeatureName,
}).strict();
