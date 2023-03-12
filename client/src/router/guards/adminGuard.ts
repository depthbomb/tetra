import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export function useAdminGuard(): NavigationGuard {
	const redirectToHome = () => {
		window.location.href = '/';
	};
	return async (to, from, next) => {
		try {
			const { admin } = useUserStore()
			if (!admin) {
				redirectToHome();
			} else {
				return next();
			}
		} catch (err: unknown) {
			redirectToHome();
		}
	};
}
