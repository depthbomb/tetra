import { defineStore } from 'pinia';

export const useTetraStore = defineStore('tetra', {
	state: () => ({
		csrfToken: ''
	})
});
