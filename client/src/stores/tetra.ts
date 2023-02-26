import { defineStore } from 'pinia';

export const useTetraStore = defineStore('tetra', {
	state: () => ({
		csrfToken: '',
		username: '',
		avatar: '',
		id: ''
	}),
	getters: {
		loggedIn: (state) => !!(state.username && state.avatar && state.id),
	}
});
