const _apiRoutes = [
    { name : 'api:links:create',         method: 'POST',   path: '/api/v1/links/create' },
    { name : 'api:links:delete',         method: 'DELETE', path: '/api/v1/links/delete/{shortcode}/{deletionKey}' },
    { name : 'api:internal:links-count', method: 'POST',   path: '/api/internal/links-count' },
];

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

    const endpoint = _apiRoutes.find(r => r.name === endpointName);
    if (endpoint) {
        const res = await fetch(endpoint.path, {
            ...init,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                'X-Csrf-Token': csrfToken
            }
        });

        if (!res.ok) {
            throw new Error(res.statusText);
        }

        const responseObj = { response: res, ...await res.json() };

        return responseObj as T;
    }

    throw new Error(`Endpoint "${endpointName}" not found`);
}
