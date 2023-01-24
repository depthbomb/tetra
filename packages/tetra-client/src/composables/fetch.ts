import { createFetch } from '@vueuse/core';

export const useTetraFetch = createFetch({
    options: {
        async beforeFetch({ options }) {
            options.headers = {
                ...options.headers,
                'X-CSRF-TOKEN': ''
            };
        }
    }
});
