<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';
	import { Menu, MenuItem, MenuItems, MenuButton } from '@headlessui/vue';

	const ListIcon        = defineAsyncComponent(() => import('~/components/icons/ListIcon.vue'));
	const SignOutIcon     = defineAsyncComponent(() => import('~/components/icons/SignOutIcon.vue'));
	const ChevronDownIcon = defineAsyncComponent(() => import('~/components/icons/ChevronDownIcon.vue'));

	const user = useUser();
</script>

<template>
	<div class="Header">
		<router-link :to="{ name: 'home' }" class="Header-brand">
			<superfishial-logo class="w-14"/>
			<p>go.super.fish</p>
		</router-link>
		<div class="Header-links">
			<router-link :to="{ name: 'home' }">Home</router-link>
			<router-link v-if="user.isLoggedIn" :to="{ name: 'user-shortlinks' }">Your Shortlinks</router-link>
			<router-link v-if="user.isLoggedIn" :to="{ name: 'api-key' }">API Key</router-link>
			<router-link :to="{ name: 'api-docs' }">API Docs</router-link>
			<router-link :to="{ name: 'faq' }">FAQ</router-link>
		</div>
		<div class="Header-user">
			<Menu v-if="user.isLoggedIn" v-slot="{ open }" as="div">
				<MenuButton class="Header-userControl">
					<img :src="user.avatar" :alt="user.username">
					<span>{{ user.username }}</span>
					<chevron-down-icon class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }"/>
				</MenuButton>
				<transition
					enter-active-class="transition duration-100 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-75 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0">
					<MenuItems class="Header-userMenu">
						<div class="py-1 px-1">
							<MenuItem>
								<router-link v-if="user.isAdmin" :to="{ name: 'admin.shortlinks' }"><list-icon class="mr-2 w-4 h-4"/> All Shortlinks</router-link>
							</MenuItem>
							<MenuItem>
								<router-link :to="{ name: 'auth.logout' }"><sign-out-icon class="mr-2 w-4 h-4"/> Sign Out</router-link>
							</MenuItem>
						</div>
					</MenuItems>
				</transition>
			</Menu>
			<app-button v-else :to="{ name: 'auth.login' }" variant="brand">
				Sign In
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
				@apply rounded-xl;
				@apply backdrop-blur;
				@apply select-none;
				@apply transition-colors;

				@apply hover:bg-gray-700 hover:bg-opacity-100;

				&.router-link-active {
					@apply bg-brand-700 bg-opacity-100;
				}
			}
		}

		.Header-user {
			@apply relative;
			@apply ml-auto;

			.Header-userControl {
				@apply flex items-center;
				@apply p-1.5;
				@apply space-x-2;
				@apply bg-black bg-opacity-25;
				@apply backdrop-blur;
				@apply rounded-xl;
				@apply transition-colors;

				@apply hover:bg-gray-700 hover:bg-opacity-100;

				img {
					@apply w-6 h-6;
					@apply rounded-lg;
				}
			}

			.Header-userMenu {
				@apply absolute;
				@apply right-0;
				@apply mt-1;
				@apply bg-gray-800;
				@apply rounded-xl;
				@apply shadow;
				@apply origin-top-right;
				@apply z-10;

				a {
					@apply flex items-center;
					@apply py-1.5 px-3;
					@apply text-sm;
					@apply rounded-lg;

					@apply hover:bg-gray-700;
				}
			}
		}
	}
</style>
