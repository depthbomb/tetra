import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export function useAuthGuard(): NavigationGuard {
	return async (to, from, next) => {
		const { loggedIn } = useUserStore();
		if (!loggedIn) {
			return next(from);
		} else {
			return next();
		}
	};
}
