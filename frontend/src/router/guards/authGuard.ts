import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export const authGuard: NavigationGuard = () => useUserStore().isLoggedIn || { name: 'home' };
