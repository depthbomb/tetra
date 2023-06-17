<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import SignInIcon from '~/components/icons/SignInIcon.vue';
	import SuperfishialLogo from '~/components/logos/SuperfishialLogo.vue';
	import { Menu, MenuItem, MenuItems, MenuButton } from '@headlessui/vue';

	const ListIcon        = defineAsyncComponent(() => import('~/components/icons/ListIcon.vue'));
	const SignOutIcon     = defineAsyncComponent(() => import('~/components/icons/SignOutIcon.vue'));
	const ChevronDownIcon = defineAsyncComponent(() => import('~/components/icons/ChevronDownIcon.vue'));

	const user = useUser();

	const closeMenu = (close: () => void) => close();
</script>

<template>
	<div class="Header">
		<router-link :to="{ name: 'home' }" class="Header-brand">
			<superfishial-logo class="w-14"/>
			<p>go.super.fish</p>
		</router-link>
		<div class="Header-links">
			<router-link :to="{ name: 'home' }">Home</router-link>
			<router-link v-if="user.isLoggedIn" :to="{ name: 'user-shortlinks' }">My Shortlinks</router-link>
			<router-link v-if="user.isLoggedIn" :to="{ name: 'api-key' }">API Key</router-link>
			<router-link :to="{ name: 'api-docs' }">API Docs</router-link>
			<router-link :to="{ name: 'faq' }">FAQ</router-link>
		</div>
		<div class="Header-user">
			<Menu v-if="user.isLoggedIn" v-slot="{ open, close }" as="div">
				<menu-button class="Header-userControl">
					<img :src="user.avatar" :alt="user.username">
					<span>{{ user.username }}</span>
					<chevron-down-icon class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }"/>
				</menu-button>
				<transition
					enter-active-class="transition duration-100 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-75 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0">
					<menu-items class="Header-userMenu">
						<!-- The menu component won't close when clicking a router link within a menu item so we'll just close it manually -->
						<div class="p-1" @click="closeMenu(close)">
							<menu-item v-if="user.isAdmin">
								<router-link :to="{ name: 'admin.shortlinks' }">
									<list-icon class="mr-2 w-4 h-4"/> All Shortlinks
								</router-link>
							</menu-item>
							<menu-item>
								<router-link :to="{ name: 'auth.logout' }"><sign-out-icon class="mr-2 w-4 h-4"/> Sign Out</router-link>
							</menu-item>
						</div>
					</menu-items>
				</transition>
			</Menu>
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

			.Header-userControl {
				@apply flex items-center;
				@apply p-1.5;
				@apply space-x-2;
				@apply bg-black bg-opacity-25;
				@apply backdrop-blur;
				@apply rounded-full;
				@apply transition-colors;

				@apply hover:bg-gray-700 hover:bg-opacity-100;

				img {
					@apply w-6 h-6;
					@apply rounded-full;
				}
			}

			.Header-userMenu {
				@apply absolute;
				@apply right-0;
				@apply mt-1;
				@apply bg-gray-800;
				@apply rounded-2xl;
				@apply shadow;
				@apply origin-top-right;
				@apply z-10;

				a {
					@apply flex items-center;
					@apply py-1.5 px-3;
					@apply text-sm;
					@apply rounded-full;

					@apply hover:bg-gray-700;
				}
			}
		}
	}
</style>
