import { database } from '@database';
import type { Task } from '@tasks';

export function createShortlinkCleanupTask(): Task {
	return {
		name: 'shortlinks-cleanup',
		interval: '1 minute',
		async execute() {
			const now = new Date();
			const result = await database.shortlink.deleteMany({
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

			console.log('Cleaned up', result.count, 'expired shortlink(s)');
		}
	}
}
