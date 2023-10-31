import { logger } from '@logger';
import { database } from '@database';
import type { Task } from '@tasks';
import { Features } from '@lib/features';

export function createShortlinkCleanupTask(): Task {
	return {
		name: 'shortlinks-cleanup',
		description: 'Deletes shortlink records that have an expiration date and have expired',
		immediate: true,
		interval: '1 minute',
		nextRun: null,
		lastRun: null,
		async execute() {
			const featureDisabled = await Features.isDisabled('SHORTLINK_CLEANUP');
			if (featureDisabled) {
				return;
			}

			const now = new Date();
			const { count } = await database.shortlink.deleteMany({
				where: {
					AND: [
						{
							expiresAt: { not: null }
						},
						{
							expiresAt: { lte: now }
						}
					]
				}
			});

			if (count > 0) {
				logger.info('Cleaned up expired shortlinks', { count });
			}
		}
	}
}
