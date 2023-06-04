import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import ApiDocs from '~/views/ApiDocsView.vue';
import LogInView from '~/views/auth/LogInView.vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthGuard, useAdminGuard, useAnonymousGuard } from '~/router/guards';

export const router = createRouter({
	history: createWebHashHistory(),
	linkActiveClass: 'is-active',
	linkExactActiveClass: 'is-exact-active',
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/my-shortlinks',
			name: 'user-shortlinks',
			beforeEnter: useAuthGuard(),
			component: () => import('~/views/UserShortlinksView.vue')
		},
		{
			path: '/api-key',
			name: 'api-key',
			beforeEnter: useAuthGuard(),
			component: () => import('~/views/ApiKeyView.vue')
		},
		{
			path: '/faq',
			name: 'faq',
			component: FAQView
		},
		{
			path: '/api',
			name: 'api-docs',
			component: ApiDocs
		},
		{
			path: '/shortlink/:shortcode',
			name: 'shortlink',
			component: () => import('~/views/ShortlinkView.vue')
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
					component: LogInView
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
			// component: () => import('~/views/admin/AdminView.vue'),
			children: [
				{
					path: 'shortlinks',
					name: 'admin.shortlinks',
					beforeEnter: useAdminGuard(),
					component: () => import('~/views/admin/AllShortlinksView.vue')
				},
				// {
				// 	path: 'users',
				// 	name: 'admin.users',
				// 	component: () => import('~/views/admin/AllUsersView.vue')
				// },
			]
		},

		// Fallback redirect
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	]
});
