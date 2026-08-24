import { useUserStore } from '~/stores/user';
import type { NavigationGuard } from 'vue-router';

export const adminGuard: NavigationGuard = () => useUserStore().isAdmin || {name: 'home'};
