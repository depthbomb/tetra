import { joinURL } from 'ufo';
import { getOrThrow } from '~config';
import { routes } from '@tetra/common';
import { compile } from 'path-to-regexp';

const _baseUrl = getOrThrow<string>('web.url');

export function getRoute(name: string, routeParams: object): string {
	const route = routes.find(r => r.name === name);

	if (!route) {
		return _baseUrl;
	}

	const { paramNames, path } = route;
	if (paramNames.length && paramNames.length === Object.keys(routeParams).length) {
		const toPath = compile(path, { encode: encodeURIComponent });

		return joinURL(_baseUrl, toPath(routeParams));
	}

	return joinURL(_baseUrl, path);
}
