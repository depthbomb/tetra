import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthGuard, useAdminGuard, useAnonymousGuard } from '~/router/guards';

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
			beforeEnter: useAuthGuard(),
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
					beforeEnter: useAnonymousGuard(),
					component: () => import('~/views/auth/LogInView.vue')
				},
				{
					path: 'logout',
					name: 'auth.logout',
					beforeEnter: useAuthGuard(),
					component: () => import('~/views/auth/LogOutView.vue')
				}
			]
		},

		// Admin Routes
		{
			path: '/admin',
			name: 'admin',
			redirect: '/admin/links',
			beforeEnter: useAdminGuard(),
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
