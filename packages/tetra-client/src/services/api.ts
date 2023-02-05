import { routes } from '@tetra/common';

interface IRoute {
	name: string;
	methods: string[];
	path: string;
	paramNames: Array<{
		name: string | number;
		prefix: string;
		suffix: string;
		pattern: string;
		modifier: string;
	}>
}

let _csrfToken = '';
async function _getCsrfToken(): Promise<string> {
	if (_csrfToken === '') {
		const { useTetraStore } = await import('~/stores/tetra');
		const globalStore = useTetraStore();

		_csrfToken = globalStore.csrfToken;
	}

	return _csrfToken;
}

export async function makeApiRequest<T>(endpointName: string, init: RequestInit = {}): Promise<T> {
	const csrfToken = await _getCsrfToken();
	if (csrfToken === '') {
		throw new Error('Unable to retrieve CSRF token');
	}

	const endpoint = routes.find(r => r.name === endpointName) as IRoute;
	if (endpoint) {
		if (init.method && !endpoint.methods.includes(init.method.toUpperCase())) {
			throw new Error(`The endpoint "${endpoint.name}" does not accept the method "${init.method}"`);
		}

		const res = await fetch(endpoint.path, {
			body: init.body,
			method: init.method,
			headers: {
				'Content-Type': 'application/json',
				'X-CSRF-TOKEN': csrfToken,
				...init.headers
			}
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message);
		}

		const responseObj = { response: res, ...data };

		return responseObj as T;
	}

	throw new Error(`Endpoint "${endpointName}" not found`);
}
