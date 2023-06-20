export function useUser() {
	const attributeValue = document.body.dataset.user!;
	const data           = JSON.parse(attributeValue);

	const username: string     = data.username;
	const avatar: string       = data.avatar;
	const drawerAvatar: string = data.drawerAvatar;
	const apiKey: string       = data.apiKey;
	const roles: string[]      = data.roles;

	const isLoggedIn = username && avatar && apiKey && roles;
	const isAdmin    = isLoggedIn && roles.includes('ROLE_ADMIN');

	return {
		username,
		avatar,
		drawerAvatar,
		apiKey,
		roles,
		isLoggedIn,
		isAdmin
	};
}
