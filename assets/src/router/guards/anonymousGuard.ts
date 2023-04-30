import { useUser } from '~/composables/useUser';
import type { NavigationGuard } from 'vue-router';

export function useAnonymousGuard(): NavigationGuard {
	return async (to, from, next) => {
		const { isLoggedIn } = useUser();
		if (isLoggedIn) {
			return next(from);
		}

		return next();
	};
}
