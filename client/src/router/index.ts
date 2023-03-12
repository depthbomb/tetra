import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import ApiDocsView from '~/views/ApiDocsView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

// Lazy load views that aren't always initially viewable
const AdminView = () => import('~/views/AdminView.vue');
const ApiKeyView = () => import('~/views/ApiKeyView.vue');

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
