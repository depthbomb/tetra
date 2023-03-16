<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import { useUserStore } from '~/stores/user';
	import LinkButton from '~/components/LinkButton.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const SignInIcon  = defineAsyncComponent(() => import('~/components/icons/SignInIcon.vue'));
	const SignOutIcon = defineAsyncComponent(() => import('~/components/icons/SignOutIcon.vue'));

	const store = useUserStore();
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
			<router-link :to="{ name: 'home' }" active-class="masthead__link--active">Home</router-link>
			<router-link v-if="store.isAdmin" :to="{ name: 'admin' }" active-class="masthead__link--active">Admin</router-link>
			<router-link v-if="store.loggedIn" :to="{ name: 'api-key' }" active-class="masthead__link--active">API Key</router-link>
			<router-link :to="{ name: 'faq' }" active-class="masthead__link--active">FAQ</router-link>
		</div>
		<a class="masthead__user">
			<template v-if="store.loggedIn">
				<div class="masthead__dropdown">
					<span class="masthead__avatar">
						<img :src="store.avatar" width="24" height="24" :alt="store.username">
					</span>
					<span class="masthead__username">{{ store.username }}</span>
				</div>
				<link-button variant="danger" size="small" :to="{ name: 'auth.logout' }">
					<sign-out-icon class="mr-1 h-4"/>
					<span>Sign Out</span>
				</link-button>
			</template>
			<template v-else>
				<link-button variant="brand" :to="{ name: 'auth.login' }">
					<sign-in-icon class="mr-1 h-4"/>
					<span>Sign In</span>
				</link-button>
			</template>
		</a>
	</header>
</template>

<style scoped lang="scss">
	.masthead {
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
				@apply text-gray-300;
				@apply transition-colors;
				@apply hover:text-white;

				&.masthead__link--disabled {
					@apply text-gray-500;
					@apply cursor-not-allowed;
					@apply pointer-events-none;
				}

				&.masthead__link--active {
					@apply text-white font-bold;
				}
			}
		}

		.masthead__user {
			@apply flex;
			@apply ml-auto;
			@apply space-x-4;

			.masthead__dropdown {
				@apply flex flex-row items-center;

				.masthead__avatar {
					@apply inline-block;
					@apply mr-2;
					@apply w-6 h-6;
					@apply rounded-full;
					@apply overflow-hidden;
				}

				.masthead__username {
					@apply text-white text-lg font-bold;
				}
			}
		}
	}
</style>
