<script setup lang="ts">
	import { ref } from 'vue';
	import { onClickOutside } from '@vueuse/core';
	import { useUser } from '~/composables/useUser';
	import KeyIcon from '~/components/icons/KeyIcon.vue';
	import ListIcon from '~/components/icons/ListIcon.vue';
	import CloseIcon from '~/components/icons/CloseIcon.vue';
	import SignOutIcon from '~/components/icons/SignOutIcon.vue';

	const sidebar    = ref(null);
	const drawerOpen = ref(false);

	const user = useUser();

	const toggleDrawer = () => {
		drawerOpen.value = !drawerOpen.value;

		document.body.classList.toggle('is-locked');
	};

	onClickOutside(sidebar, toggleDrawer);
</script>

<template>
	<aside class="UserDrawer">
		<button class="UserDrawer-activator" type="button" @click="toggleDrawer()">
			<img :src="user.avatar" :alt="user.username">
			<span>{{ user.username }}</span>
		</button>
		<div v-if="drawerOpen" class="UserDrawer-overlay">
			<div ref="sidebar" class="UserDrawer-sidebar">
				<header class="UserDrawer-sidebar-header">
					<div class="UserDrawer-user">
						<img :src="user.drawerAvatar" :alt="user.username">
						<span>{{ user.username }}</span>
					</div>
					<div class="UserDrawer-close-button">
						<button type="button" @click="toggleDrawer()">
							<close-icon class="w-4 h-4"/>
						</button>
					</div>
				</header>
				<!--
					Just close the sidebar whenever anything within this container is clicked until
					I come up with a more thorough solution.
				-->
				<div class="UserDrawer-sidebar-links" @click="toggleDrawer()">
					<template v-if="user.isAdmin">
						<router-link :to="{ name: 'admin.shortlinks' }">
							<list-icon/> All Shortlinks (Admin)
						</router-link>
						<hr>
					</template>
					<router-link :to="{ name: 'user-shortlinks' }">
						<list-icon/> My Shortlinks
					</router-link>
					<router-link :to="{ name: 'api-key' }">
						<key-icon/> API Key
					</router-link>
					<hr>
					<router-link :to="{ name: 'auth.logout' }">
						<sign-out-icon/> Sign Out
					</router-link>
				</div>
			</div>
		</div>
	</aside>
</template>

<style scoped lang="scss">
	.UserDrawer {
		.UserDrawer-activator {
			@apply flex items-center;
			@apply p-1.5;
			@apply space-x-2;
			@apply bg-transparent;
			@apply rounded-full;
			@apply transition-colors;

			@apply hover:bg-gray-800;

			img {
				@apply w-6 h-6;
				@apply rounded-full;
			}
		}

		.UserDrawer-overlay {
			@apply fixed;
			@apply top-0 right-0 bottom-0 left-0;
			@apply flex;
			@apply justify-end items-center;
			@apply bg-black bg-opacity-50;
			@apply backdrop-blur;
			@apply z-[512];

			.UserDrawer-sidebar {
				@apply p-4;
				@apply min-w-[256px];
				@apply h-screen;
				@apply bg-gray-700;
				@apply rounded-l-xl;
				@apply shadow-lg;
				@apply animate-slideInLeft;

				.UserDrawer-sidebar-header {
					@apply grid grid-cols-2 grid-rows-1;

					.UserDrawer-user {
						@apply flex items-center flex-grow;
						@apply space-x-3;
						@apply w-full;

						img {
							@apply w-8 h-8;
							@apply rounded-full;
							@apply shadow-sm;
						}
					}

					.UserDrawer-close-button {
						@apply flex items-center justify-end;

						button {
							@apply p-3;
							@apply text-gray-200;
							@apply bg-transparent;
							@apply rounded-full;
							@apply transition-colors;

							@apply hover:text-white;
							@apply hover:bg-gray-800;
						}
					}
				}

				.UserDrawer-sidebar-links {
					@apply mt-3;
					@apply flex flex-col items-stretch;
					@apply space-y-2;

					a, button {
						@apply py-1.5 px-3;
						@apply flex flex-row items-center;
						@apply text-sm;
						@apply bg-transparent;
						@apply rounded-full;
						@apply transition-colors;

						@apply hover:bg-gray-800;

						&.is-active {
							@apply bg-brand-700;
						}

						svg {
							@apply mr-2;
							@apply w-4 h-4;
						}
					}

					hr {
						@apply h-[1px];
						@apply bg-gray-600;
						@apply border-0;
					}
				}
			}
		}
	}
</style>
