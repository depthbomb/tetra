import { makeApiRequest } from '~/services/api';
import type { NavigationGuard } from 'vue-router';
import type { ICheckpointResponse } from '~/@types/ICheckpointResponse';

export function useAdminGuard(): NavigationGuard {
	const redirectToHome = () => {
		window.location.href = '/';
	};
	return async (to, from, next) => {
		try {
			const { admin } = await makeApiRequest<ICheckpointResponse>('/internal/checkpoint', { method: 'POST' });
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
