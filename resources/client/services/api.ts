import routes from '~/routes.json';

let _csrfToken = '';
async function _getCsrfToken(): Promise<string> {
    if (_csrfToken === '') {
        const { useTetraStore } = await import('~/stores/tetra');
        const globalStore = useTetraStore();

        _csrfToken = globalStore.csrfToken;
    }

    return _csrfToken;
}

export async function getApiData<T>(endpointName: string, method: 'GET'|'PUT'|'POST'|'DELETE' = 'POST'): Promise<T> {
    const csrfToken = await _getCsrfToken();
    if (csrfToken === '') {
        throw new Error('Unable to retrieve CSRF token');
    }

    const endpoint = routes.find(r => r.name === endpointName);
    if (endpoint) {
        const res = await fetch(endpoint.uri, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        return await res.json() as T;
    }

    throw new Error(`Endpoint "${endpointName}" not found`);
}
