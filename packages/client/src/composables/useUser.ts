import { useBridge } from '~/composables/useBridge';

export function useUser() {
	const userPayload = useBridge('user');
	const data        = JSON.parse(userPayload);

	const username: string                   = data.username;
	const avatars: { [key: string]: string } = data.avatars;
	const apiKey: string                     = data.apiKey;
	const isAdmin: boolean                   = data.admin;
	const isLoggedIn                         = username && avatars && apiKey;

	return {
		username,
		avatars,
		apiKey,
		isLoggedIn,
		isAdmin
	};
}
