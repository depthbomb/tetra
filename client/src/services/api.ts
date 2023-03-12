export async function makeApiRequest<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
	const res = await fetch(endpoint, {
		body: init.body,
		method: init.method,
		headers: {
			'Content-Type': 'application/json',
			...init.headers
		}
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message);
	}

	return data as T;
}
