import { createRouter, createWebHashHistory } from 'vue-router';

const HomeView = () => import('~/views/HomeView.vue');
const ApiDocsView = () => import('~/views/ApiDocsView.vue');
const DashboardView = () => import('~/views/DashboardView.vue');

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/',                name: 'home',      component: HomeView },
		{ path: '/api',             name: 'api-docs',  component: ApiDocsView },
		{ path: '/dashboard',       name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});

router.beforeEach(async (to, from) => {
	if (to.meta.requiresAuth) {
		const { useTetraStore } = await import('~/stores/tetra');
		const store             = useTetraStore();
		const loggedIn          = store.loggedIn;

		if (!loggedIn) {
			window.location.href = '/auth/login';
		}

		return loggedIn;
	}
});

export default router;
