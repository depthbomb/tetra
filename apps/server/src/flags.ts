import { typeFlag } from 'type-flag';

export const { flags } = typeFlag({
	dev: {
		type: Boolean,
		alias: 'd',
		default: false
	}
}, process.argv.slice(2));
