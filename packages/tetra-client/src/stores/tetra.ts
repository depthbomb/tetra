import { defineStore } from 'pinia';

export const useTetraStore = defineStore('tetra', {
	state: () => ({
		csrfToken: '',
		username: '',
		avatar: '',
		sub: ''
	}),
	getters: {
		loggedIn: (state) => !!(state.username && state.avatar && state.sub),
	}
});
