import { makeApiRequest } from '~/services/api';
import type { NavigationGuard } from 'vue-router';
import type { ICheckpointResponse } from '~/@types/ICheckpointResponse';

export function useAuthGuard(): NavigationGuard {
	const alertNoSession = () => {
		alert('Your session has expired, please log in again.');
		window.location.href = '/auth/logout';
	};
	return async (to, from, next) => {
		try {
			const { auth } = await makeApiRequest<ICheckpointResponse>('/internal/checkpoint', { method: 'POST' });
			if (!auth) {
				alertNoSession();
			} else {
				return next();
			}
		} catch (err: unknown) {
			alertNoSession();
		}
	};
}
