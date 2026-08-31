import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
	const username    = ref<string>('');
	const avatars     = ref<Record<string, string>>({});
	const apiKey      = ref<string>('');
	const isAdmin     = ref<boolean>(false);
	const initialized = ref<boolean>(false);
	const isLoggedIn  = computed(() => Boolean(username.value && apiKey.value));

	async function initialize(): Promise<void> {
		if (initialized.value) return;

		try {
			const response = await fetch('/oidc/session', {
				headers: { Accept: 'application/json' },
				credentials: 'same-origin'
			});
			if (response.ok) {
				const data = await response.json() as {
					username: string;
					avatars?: Record<string, string>;
					apiKey: string;
					admin: boolean;
				};

				username.value = data.username;
				avatars.value = data.avatars ?? {};
				apiKey.value = data.apiKey;
				isAdmin.value = data.admin;
			}
		} catch (error) {
			console.warn('Unable to initialize the authenticated session.', error);
		} finally {
			initialized.value = true;
		}
	}

	function setApiKey(input: string): void {
		apiKey.value = input;
	}

	return {
		username,
		avatars,
		apiKey,
		isLoggedIn,
		isAdmin,
		initialized,

		initialize,
		setApiKey,
	};
});
