import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export function useAdminGuard(): NavigationGuard {
	const redirectToHome = () => {
		window.location.href = '/';
	};
	return async (to, from, next) => {
		const { isAdmin } = useUserStore();
		if (!isAdmin) {
			redirectToHome();
		} else {
			return next();
		}
	};
}
