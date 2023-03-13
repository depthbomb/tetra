import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/faq',
			name: 'faq',
			component: FAQView
		},
		{
			path: '/api',
			name: 'api-docs',
			component: () => import('~/views/ApiDocsView.vue')
		},
		{
			path: '/api-key',
			name: 'api-key',
			component: () => import('~/views/ApiKeyView.vue')
		},

		// Admin Routes
		{
			path: '/admin',
			name: 'admin',
			redirect: '/admin/links'
		},
		{
			path: '/admin/links',
			name: 'admin.links',
			component: () => import('~/views/admin/AllLinksView.vue')
		},

		// Fallback redirect
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});
