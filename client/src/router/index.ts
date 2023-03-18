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

		// Auth routes
		{
			path: '/auth',
			name: 'auth',
			children: [
				{
					path: 'login',
					name: 'auth.login',
					component: () => import('~/views/auth/LogInView.vue')
				},
				{
					path: 'logout',
					name: 'auth.logout',
					component: () => import('~/views/auth/LogOutView.vue')
				}
			]
		},

		// Admin Routes
		{
			path: '/admin',
			name: 'admin',
			// component: () => import('~/views/admin/AdminView.vue'),
			children: [
				{
					path: 'links',
					name: 'admin.links',
					component: () => import('~/views/admin/AllLinksView.vue')
				},
				{
					path: 'users',
					name: 'admin.users',
					component: () => import('~/views/admin/AllUsersView.vue')
				},
			]
		},

		// Fallback redirect
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});
