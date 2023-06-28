<script setup lang="ts">
	import { ref, defineAsyncComponent } from 'vue';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import { useConfig } from '~/composables/useConfig';
	import { useFeatures } from '~/composables/useFeature';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const AppUserDrawer = defineAsyncComponent(() => import('./AppUserDrawer.vue'));

	const { authUrl }          = useConfig();
	const { isLoggedIn }       = useUser();
	const { isFeatureEnabled } = useFeatures();

	const loginButtonEnabled = ref(isFeatureEnabled('USER_LOGIN'));
</script>

<template>
	<div class="Header">
		<router-link :to="{ name: 'home' }" class="Header-brand">
			<superfishial-logo class="w-12"/>
			<span>go.super.fish</span>
		</router-link>
		<div class="Header-links">
			<router-link :to="{ name: 'home' }">Home</router-link>
			<router-link :to="{ name: 'api-docs' }">API Docs</router-link>
			<router-link :to="{ name: 'faq' }">FAQ</router-link>
		</div>
		<div class="Header-user">
			<app-user-drawer v-if="isLoggedIn"/>
			<app-button v-else :to="authUrl" variant="brand" size="small" :disabled="!loginButtonEnabled">
				<sign-in-icon class="mr-2 w-3.5 h-3.5"/>
				<span>Sign In</span>
			</app-button>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.Header {
		@apply fixed;
		@apply flex items-center;
		@apply py-1.5 px-3;
		@apply w-full;
		@apply bg-gray-900 bg-opacity-90;
		@apply backdrop-blur-lg;
		@apply z-[256];

		.Header-brand {
			@apply flex items-center;
			@apply mr-6;
			@apply space-x-3;

			span {
				@apply text-2xl font-serif;
			}
		}

		.Header-links {
			@apply flex items-center;
			@apply space-x-3;

			a {
				@apply py-1.5 px-3;
				@apply text-gray-300;
				@apply bg-transparent;
				@apply rounded;
				@apply select-none;
				@apply transition-colors;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-950;

				&.is-active {
					@apply text-white;
					@apply bg-brand-700;
				}
			}
		}

		.Header-user {
			@apply relative;
			@apply ml-auto;
		}
	}
</style>
