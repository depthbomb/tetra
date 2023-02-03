import { getOrThrow } from '~config';
import { VIEWS_PATH } from '~constants';
import { configure, renderFileAsync } from 'eta';

const production = !getOrThrow<boolean>('development');

configure({
	async: true,
	cache: production,
	views: VIEWS_PATH,
	autoTrim: production ? ['nl', 'slurp'] : false,
	rmWhitespace: production,
});

export async function renderView(name: string, viewData: object): Promise<string> {
	return await renderFileAsync(name, viewData);
}
