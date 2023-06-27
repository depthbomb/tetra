export function useUser() {
	const attribute = document.querySelector('meta[name="user"]') as HTMLMetaElement;
	const data      = JSON.parse(attribute.content);

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
