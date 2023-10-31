import { logger } from '@logger';
import { database } from '@database';
import type { Task } from '@tasks';

export function createPruneRateLimitsTask(): Task {
	return {
		name: 'prune-rate-limits',
		description: 'Deletes rate limit records that have expired',
		interval: '24 hours',
		nextRun: null,
		lastRun: null,
		async execute() {
			const now = new Date();
			const { count } = await database.rateLimit.deleteMany({
				where: {
					expiresAt: { lte: now }
				}
			});

			logger.info('Pruned expired rate limits', { count });
		}
	}
}
