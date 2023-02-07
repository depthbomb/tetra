import { deleteExpiredLinks } from '~modules/links';
import type { ITetraJob } from '@tetra/common';

/**
 * Creates a job to delete links whose `expiresAt` column is currently or after the current date
 */
export function createDeleteExpiredLinksJob(): ITetraJob {
	return ({
		name: 'delete expired links',
		description: 'Deletes expired shortlinks',
		interval: '1 minute',
		async execute(): Promise<void> {
			await deleteExpiredLinks();
		},
	})
}
