import { logger } from '@logger';
import { database } from '@database';
import type { Task } from '@tasks';
import { Features } from '@lib/features';

export function createShortlinkCleanupTask(): Task {
	return {
		name: 'shortlinks-cleanup',
		interval: '1 minute',
		async execute() {
			if (Features.isDisabled('SHORTLINK_CLEANUP')) {
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

			logger.info('Cleaned up expired shortlink', { count });
		}
	}
}
