import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
	state: () => ({
		username: '',
		avatar: '',
		admin: false,
	}),
	getters: {
		loggedIn: (state) => !!(state.username && state.avatar),
		isAdmin: (state) => !!(state.username && state.avatar) && state.admin
	}
});
