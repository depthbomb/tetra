import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
	state: () => ({
		id: '',
		username: '',
		avatar: '',
		apiKey: '',
		admin: false,
	}),
	getters: {
		loggedIn: (state) => !!(state.username && state.avatar && state.id),
		isAdmin: (state) => !!(state.username && state.avatar && state.id) && state.admin
	}
});
