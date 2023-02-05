import { Logger } from 'tslog';
import { getOrThrow } from '~config';

const production = !getOrThrow<boolean>('development');

export const log = new Logger({
	name: 'TETRA',
	type: production ? 'json' : 'pretty',
	minLevel: production ? 3 : 0,
});
