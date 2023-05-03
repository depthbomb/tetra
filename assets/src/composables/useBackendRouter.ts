import { ref } from 'vue';
import routes from '~/routes.json';
import type { Ref } from 'vue';

type RouteTokens = { [token: string]: string };
type QueryParams = { [key: string]: string | number | boolean };

export function useBackendRouter() {
	const tokenRegex = /{(\w+)}/g;

	function getEndpoint(name: string, tokens?: RouteTokens, queryParams?: QueryParams): Ref<string> {
		const endpoint = ref('');

		if (!(name in routes)) {
			throw new Error(`Unknown route name: ${name}`);
		}

		endpoint.value = routes[name].path;

		if (tokens) {
			endpoint.value = endpoint.value.replace(tokenRegex, (match, token) => tokens[token] || match);
		}

		if (queryParams) {
			const queryString = Object.keys(queryParams)
				.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
				.join('&');
			endpoint.value += `?${queryString}`;
		}

		return endpoint;
	}

	return { getEndpoint };
}
