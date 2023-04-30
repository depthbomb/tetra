export function useUser() {
	let username = '';
	let avatar   = '';
	let apiKey   = '';
	let roles    = <string[]>[];

	const data = document.body.getAttribute('data-user');

	if (data !== '[]') {
		const parsed = JSON.parse(decodeURIComponent(data!));

		username = parsed.username;
		avatar   = parsed.avatar;
		apiKey   = parsed.apiKey;
		roles    = parsed.roles;
	}

	const isLoggedIn = username !== '' && avatar !== '' && apiKey !== '' && roles.length;
	const isAdmin    = isLoggedIn && roles.includes('ROLE_ADMIN');

	return {
		username,
		avatar,
		apiKey,
		roles,
		isLoggedIn,
		isAdmin
	};
}
