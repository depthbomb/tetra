<script setup lang="ts">
	import { useUserStore } from '~/stores/user';
	import { ref, defineAsyncComponent } from 'vue';
	import AppButton from '~/components/AppButton.vue';
	import { useFeatures } from '~/composables/useFeature';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const AppUserDrawer = defineAsyncComponent(() => import('./AppUserDrawer.vue'));

	const { isLoggedIn }       = useUserStore();
	const { isFeatureEnabled } = useFeatures();

	const loginButtonEnabled = ref(isFeatureEnabled('AUTHENTICATION'));
</script>

<template>
	<header class="Masthead">
		<router-link :to="{ name: 'home' }" class="Masthead-brand">
			<superfishial-logo class="w-12"/>
			<span>go.super.fish</span>
		</router-link>
		<div class="Masthead-links">
			<router-link :to="{ name: 'home' }" class="Masthead-link">
				<span>Home</span>
			</router-link>
			<router-link :to="{ name: 'faq' }" class="Masthead-link">FAQ</router-link>
			<a href="/api" class="Masthead-link">API</a>
		</div>
		<div class="Masthead-user">
			<app-user-drawer v-if="isLoggedIn"/>
			<app-button v-else to="/oidc/start" variant="brand" size="small" :disabled="!loginButtonEnabled">
				<sign-in-icon class="mr-2 w-3.5 h-3.5"/>
				<span>Sign In</span>
			</app-button>
		</div>
	</header>
</template>

<style scoped lang="scss">
	.Masthead {
		@apply fixed;
		@apply flex items-center;
		@apply gap-6;
		@apply px-3;
		@apply w-full h-12;
		@apply bg-gray-900;
		@apply shadow-lg;
		@apply z-[256];

		.Masthead-brand {
			@apply flex items-center;
			@apply gap-3;

			span {
				@apply text-2xl font-serif font-bold;
			}
		}

		.Masthead-links {
			@apply flex items-center;

			.Masthead-link {
				@apply flex items-center;
				@apply pt-1 px-4;
				@apply h-12;
				@apply text-gray-400;
				@apply bg-transparent;
				@apply border-b-4 border-transparent;
				@apply select-none;
				@apply box-border;
				@apply transition-colors;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-600;

				&.is-active {
					@apply text-white;
					@apply border-brand-600;
				}
			}
		}

		.Masthead-user {
			@apply ml-auto;
		}
	}
</style>
