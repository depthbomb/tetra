import { defineStore } from 'pinia';

export const useTetraStore = defineStore('tetra', {
	state: () => ({
		csrfToken: '',
		username: '',
		avatar: '',
		id: '',
		admin: false,
		statsHubEndpoint: ''
	}),
	getters: {
		loggedIn: (state) => !!(state.username && state.avatar && state.id),
		isAdmin: (state) => !!(state.username && state.avatar && state.id) && state.admin
	}
});
