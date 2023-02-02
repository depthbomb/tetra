import type { ITetraJob } from '@tetra/types';

export function createTestJob(): ITetraJob {
	return ({
		name: 'test',
		description: 'Test job',
		interval: '5s',
		async execute(): Promise<void> {},
	})
}
