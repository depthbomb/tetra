let _csrfToken = '';
async function _getCsrfToken(): Promise<string> {
	if (_csrfToken === '') {
		const { useTetraStore } = await import('~/stores/tetra');
		const globalStore = useTetraStore();

		_csrfToken = globalStore.csrfToken;
	}

	return _csrfToken;
}

export async function makeApiRequest<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
	const csrfToken = await _getCsrfToken();
	if (csrfToken === '') {
		throw new Error('Unable to retrieve CSRF token');
	}

	const res = await fetch(endpoint, {
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

	return data as T;
}
