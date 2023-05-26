import { useUser } from '~/composables/useUser';
import type { NavigationGuard } from 'vue-router';

export function useAdminGuard(): NavigationGuard {
	const redirectToHome = () => {
		window.location.href = '/';
	};
	return async (to, from, next) => {
		const { isAdmin } = useUser();
		if (!isAdmin) {
			redirectToHome();
		} else {
			return next();
		}
	};
}
