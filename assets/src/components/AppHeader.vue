<script setup lang="ts">
	import { ref, defineAsyncComponent } from 'vue';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import { useFeatures } from '~/composables/useFeature';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';

	const AppUserDrawer = defineAsyncComponent(() => import('./AppUserDrawer.vue'));

	const { isLoggedIn }       = useUser();
	const { isFeatureEnabled } = useFeatures();

	const loginButtonEnabled = ref(isFeatureEnabled('USER_LOGIN'));
</script>

<template>
	<header class="Masthead">
		<router-link :to="{ name: 'home' }" class="Masthead-brand">
			<superfishial-logo class="w-12"/>
			<span>go.super.fish</span>
		</router-link>
		<div class="Masthead-links">
			<router-link :to="{ name: 'home' }" class="Masthead-link">Home</router-link>
			<router-link :to="{ name: 'api-docs' }" class="Masthead-link">API Docs</router-link>
			<router-link :to="{ name: 'faq' }" class="Masthead-link">FAQ</router-link>
		</div>
		<div class="Masthead-user">
			<app-user-drawer v-if="isLoggedIn"/>
			<app-button v-else to="/oidc/start" variant="brand" size="small" :disabled="!loginButtonEnabled">
				<sign-in-icon class="mr-2 w-3.5 h-3.5"/>
				<span>Sign In via Superfishial</span>
			</app-button>
		</div>
	</header>
</template>

<style scoped lang="scss">
	.Masthead {
		@apply fixed;
		@apply flex items-center;
		@apply gap-6;
		@apply py-1.5 px-3;
		@apply w-full h-12;
		@apply bg-gray-900;
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
			@apply gap-1.5;

			.Masthead-link {
				@apply py-1 px-2.5;
				@apply text-gray-300;
				@apply bg-transparent;
				@apply rounded-full;
				@apply select-none;
				@apply transition-colors;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-600;

				&.is-active {
					@apply text-white;
					@apply bg-brand-600 hover:bg-brand-600;
				}
			}
		}

		.Masthead-user {
			@apply ml-auto;

			.Masthead-user-control {
				@apply flex items-center;
				@apply gap-1.5;
				@apply py-1 px-2.5;
				@apply text-gray-300;
				@apply rounded-full;
				@apply select-none;
				@apply transition-colors;

				@apply hover:text-white hover:bg-gray-700;
				@apply active:text-white active:bg-gray-600;

				img {
					@apply w-5 h-5;
					@apply rounded-full;
				}
			}
		}
	}
</style>
