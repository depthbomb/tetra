import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const AdminView = () => import('~/views/AdminView.vue');
const ApiKeyView = () => import('~/views/ApiKeyView.vue');
const ApiDocsView = () => import('~/views/ApiDocsView.vue');

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/',                name: 'home',     component: HomeView },
		{ path: '/admin',           name: 'admin',    component: AdminView },
		{ path: '/faq',             name: 'faq',      component: FAQView },
		{ path: '/api',             name: 'api-docs', component: ApiDocsView },
		{ path: '/api-key',         name: 'api-key',  component: ApiKeyView },
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});
