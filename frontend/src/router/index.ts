import FAQView from '~/views/FAQView.vue';
import HomeView from '~/views/HomeView.vue';
import { authGuard, adminGuard } from '~/router/guards';
import { createRouter, createWebHistory } from 'vue-router';

export const router = createRouter({
	history: createWebHistory(),
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
			beforeEnter: authGuard,
			component: () => import('~/views/UserShortlinksView.vue')
		},
		{
			path: '/api-key',
			name: 'api-key',
			beforeEnter: authGuard,
			component: () => import('~/views/ApiKeyView.vue')
		},
		{
			path: '/faq',
			name: 'faq',
			component: FAQView
		},
		{
			path: '/docs',
			name: 'api-docs',
			component: () => import('~/views/ApiDocsView.vue'),
			meta: { fullWidth: true, apiDocs: true }
		},
		{
			path: '/shortlink/:shortcode',
			name: 'shortlink',
			component: () => import('~/views/ShortlinkView.vue')
		},
		// Admin Routes
		{
			path: '/admin',
			name: 'admin',
			beforeEnter: adminGuard,
			children: [
				{
					path: 'shortlinks',
					name: 'admin.shortlinks',
					component: () => import('~/views/admin/AllShortlinksView.vue')
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
