export async function makeAPIRequest<T>(endpoint: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; getJSON: () => Promise<T>; }> {
	const res = await fetch(endpoint, {
		body: init.body,
		method: init.method,
		headers: {
			'Content-Type': 'application/json',
			...init.headers
		}
	});

	const { ok, status } = res;

	const getJSON = async () => {
		return await res.json() as T;
	};

	return { ok, status, getJSON };
}
