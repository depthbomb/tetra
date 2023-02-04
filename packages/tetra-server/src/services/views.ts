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

/**
 * Renders an [Eta](https://eta.js.org/)-based view template file to HTML
 * @param name The name of the view relative to the `views` directory minus extension
 * @param viewData An object containing data that will be passed and accessible in the rendered view
 * @returns The rendered view HTML content
 */
export async function renderView(name: string, viewData: object): Promise<string> {
	return await renderFileAsync(name, viewData);
}
