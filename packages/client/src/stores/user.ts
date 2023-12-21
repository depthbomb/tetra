import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useBridge } from '~/composables/useBridge';

export const useUserStore = defineStore('user', () => {
	const userPayload = useBridge('user');
	const data        = JSON.parse(userPayload);

	const username   = ref<string>(data.username);
	const avatars    = ref<{ [key: string]: string }>(data.avatars);
	const apiKey     = ref<string>(data.apiKey);
	const isAdmin    = ref<boolean>(data.admin);
	const isLoggedIn = ref<boolean>(!!username.value && !!avatars.value && !!apiKey.value);

	function setApiKey(input: string): void {
		apiKey.value = input;
	}

	return {
		username,
		avatars,
		apiKey,
		isLoggedIn,
		isAdmin,

		setApiKey,
	};
});
