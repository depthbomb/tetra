import { useAdminGuard, useAuthGuard } from '~/router/guards';
import { createRouter, createWebHashHistory } from 'vue-router';

const HomeView = () => import('~/views/HomeView.vue');
const AdminView = () => import('~/views/AdminView.vue');
const FAQView = () => import('~/views/FAQView.vue');
const ApiKeyView = () => import('~/views/ApiKeyView.vue');
const ApiDocsView = () => import('~/views/ApiDocsView.vue');

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/',                name: 'home',     component: HomeView },
		{ path: '/admin',           name: 'admin',    component: AdminView, beforeEnter: useAdminGuard() },
		{ path: '/faq',             name: 'faq',      component: FAQView },
		{ path: '/api',             name: 'api-docs', component: ApiDocsView },
		{ path: '/api-key',         name: 'api-key',  component: ApiKeyView, beforeEnter: useAuthGuard() },
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});

export default router;
