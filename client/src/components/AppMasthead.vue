<script setup lang="ts">
	import { useRouter } from 'vue-router';
	import { useUserStore } from '~/stores/user';
	import { onClickOutside } from '@vueuse/core';
	import LinkButton from '~/components/LinkButton.vue';
	import { ref, computed, defineAsyncComponent } from 'vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const SignInIcon  = defineAsyncComponent(() => import('~/components/icons/SignInIcon.vue'));
	const SignOutIcon = defineAsyncComponent(() => import('~/components/icons/SignOutIcon.vue'));

	const router        = useRouter();
	const adminMenu     = ref(null);
	const adminMenuOpen = ref(false);
	const isAdminRoute  = computed(() => router.currentRoute.value.path.startsWith('/admin'));
	const store         = useUserStore();

	onClickOutside(adminMenu, () => adminMenuOpen.value = false);
</script>

<template>
	<header class="masthead">
		<router-link :to="{ name: 'home' }" class="masthead__brand">
			<div class="masthead__logo">
				<superfishial-logo class="w-14"/>
			</div>
			<span class="masthead__title">go.super.fish</span>
		</router-link>
		<div class="masthead__links">
			<router-link :to="{ name: 'home' }" active-class="masthead__link--active">
				<span>Home</span>
			</router-link>
			<a :class="{ 'masthead__link--active': isAdminRoute }" @click="adminMenuOpen = !adminMenuOpen">
				<span>Admin</span>
				<div ref="adminMenu" v-if="adminMenuOpen" class="masthead__dropdown-menu">
					<router-link :to="{ name: 'admin.links' }">All Links</router-link>
					<router-link :to="{ name: 'admin.users' }">All Users</router-link>
				</div>
			</a>
			<router-link v-if="store.loggedIn" :to="{ name: 'api-key' }" active-class="masthead__link--active">
				<span>API Key</span>
			</router-link>
			<router-link :to="{ name: 'faq' }" active-class="masthead__link--active">
				<span>FAQ</span>
			</router-link>
		</div>
		<div v-if="store.loggedIn" class="masthead__user">
			<span class="masthead__avatar">
				<img :src="store.avatar" width="24" height="24" :alt="store.username">
			</span>
			<span class="masthead__username">{{ store.username }}</span>
		</div>
		<link-button v-if="store.loggedIn" variant="danger" size="small" :to="{ name: 'auth.logout' }" class="ml-4">
			<sign-out-icon class="mr-1 h-4"/>
			<span>Sign Out</span>
		</link-button>
		<link-button v-else variant="brand" :to="{ name: 'auth.login' }" class="ml-auto">
			<sign-in-icon class="mr-1 h-4"/>
			<span>Sign In</span>
		</link-button>
	</header>
</template>

<style scoped lang="scss">
	.masthead {
		@apply relative;
		@apply flex flex-row items-center flex-shrink-0;
		@apply px-8;
		@apply w-full h-14;
		@apply bg-gray-800;
		@apply shadow-lg;

		.masthead__brand {
			@apply flex flex-row items-center;
			@apply mr-8;
			@apply space-x-3;

			.masthead__title {
				@apply font-serif text-2xl text-gray-50;
			}
		}

		.masthead__links {
			@apply flex flex-row items-center;
			@apply space-x-4;

			a {
				@apply text-gray-300 font-serif;
				@apply transition-colors;
				@apply hover:text-white;

				&.masthead__link--disabled {
					@apply text-gray-500;
					@apply cursor-not-allowed;
					@apply pointer-events-none;
				}

				&.masthead__link--active > span {
					@apply text-white font-bold;
				}

				.masthead__dropdown-menu {
					@apply absolute top-14;
					@apply flex flex-col;
					@apply p-2;
					@apply space-y-1;
					@apply bg-gray-800;
					@apply rounded-b;
					@apply shadow;
					@apply transition-all;

					a {
						@apply py-2 px-4;
						@apply text-gray-200;
						@apply rounded;

						@apply hover:bg-gray-700;

						&.router-link-active {
							@apply font-bold;
						}
					}
				}
			}
		}

		.masthead__user {
			@apply flex flex-row items-center;
			@apply ml-auto;

			.masthead__avatar {
				@apply inline-block;
				@apply mr-2;
				@apply w-6 h-6;
				@apply rounded;
				@apply overflow-hidden;
			}

			.masthead__username {
				@apply text-white text-lg font-serif font-bold;
			}
		}
	}
</style>
