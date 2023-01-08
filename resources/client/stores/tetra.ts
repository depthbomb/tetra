import { defineStore } from 'pinia';

export const useTetraStore = defineStore('tetra', {
    state: () => ({
        csrfToken: '',
        requestIp: '',
        initTime: 0,
        initTimeFloat: 0.0
    })
});
