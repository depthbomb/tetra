<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const AppUserDrawer = defineAsyncComponent(() => import('./AppUserDrawer.vue'));

	const { isLoggedIn } = useUser();
</script>

<template>
	<div class="Header">
		<router-link :to="{ name: 'home' }" class="Header-brand">
			<superfishial-logo class="w-14"/>
			<p>go.super.fish</p>
		</router-link>
		<div class="Header-links">
			<router-link :to="{ name: 'home' }">Home</router-link>
			<router-link :to="{ name: 'api-docs' }">API Docs</router-link>
			<router-link :to="{ name: 'faq' }">FAQ</router-link>
		</div>
		<div class="Header-user">
			<app-user-drawer v-if="isLoggedIn"/>
			<app-button v-else :to="{ name: 'auth.login' }" variant="brand">
				<sign-in-icon class="mr-2 w-4 h-4"/>
				<span>Sign In</span>
			</app-button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.Header {
		@apply flex items-center;
		@apply p-6;
		@apply w-full;

		.Header-brand {
			@apply flex items-center;
			@apply mr-6;
			@apply space-x-3;

			p {
				@apply text-3xl font-serif;
			}
		}

		.Header-links {
			@apply flex items-center;
			@apply space-x-3;

			a {
				@apply py-1.5 px-4;
				@apply bg-black bg-opacity-25;
				@apply rounded-full;
				@apply backdrop-blur;
				@apply select-none;
				@apply transition-colors;

				@apply hover:bg-gray-700 hover:bg-opacity-100;

				&.is-active {
					@apply bg-brand-700 bg-opacity-100;
				}
			}
		}

		.Header-user {
			@apply relative;
			@apply ml-auto;
		}
	}
</style>
