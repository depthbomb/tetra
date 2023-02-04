import { log } from '~logger';
import { Links } from '~database/models/Link';
import type { ITetraJob } from '@tetra/types';

/**
 * Creates a job to delete links whose `expiresAt` column is currently or after the current date
 */
export function createDeleteExpiredLinksJob(): ITetraJob {
	const logger = log.getSubLogger({ name: 'JOBS' });
	return ({
		name: 'delete expired links',
		description: 'Deletes expired shortlinks',
		interval: '1 minute',
		async execute(): Promise<void> {
			const now = new Date();
			const { deletedCount } = await Links.deleteMany({ expiresAt: { $lte: now } });
			if (deletedCount > 0) {
				logger.info('Deleted', deletedCount, 'expired link(s)');
			} else {
				logger.debug('No links to expire');
			}
		},
	})
}
