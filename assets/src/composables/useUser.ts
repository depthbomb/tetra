export function useUser() {
	const attributeValue = document.body.dataset.user!;
	const data           = JSON.parse(attributeValue);

	const username: string                   = data.username;
	const avatars: { [key: string]: string } = data.avatars;
	const apiKey: string                     = data.apiKey;
	const roles: string[]                    = data.roles;

	const isLoggedIn = username && avatars && apiKey && roles;
	const isAdmin    = isLoggedIn && roles.includes('ROLE_ADMIN');

	return {
		username,
		avatars,
		apiKey,
		roles,
		isLoggedIn,
		isAdmin
	};
}
