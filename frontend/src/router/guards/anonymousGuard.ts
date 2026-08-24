import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export const anonymousGuard: NavigationGuard = () => !useUserStore().isLoggedIn || { name: 'home' };
