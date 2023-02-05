import { createRouter, createWebHashHistory } from 'vue-router';

const HomeView = () => import('~/views/HomeView.vue');
const ApiDocsView = () => import('~/views/ApiDocsView.vue');

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/',                name: 'home', component: HomeView },
		{ path: '/api',             name: 'api-docs', component: ApiDocsView },
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
})

export default router;
