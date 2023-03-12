import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export function useAuthGuard(): NavigationGuard {
	const alertNoSession = () => {
		alert('Your session has expired, please log in again.');
		window.location.href = '/auth/logout';
	};
	return async (to, from, next) => {
		try {
			const { loggedIn } = useUserStore();
			if (!loggedIn) {
				alertNoSession();
			} else {
				return next();
			}
		} catch (err: unknown) {
			alertNoSession();
		}
	};
}
