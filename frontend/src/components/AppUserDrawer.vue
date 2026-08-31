<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from '~/stores/user';
import { onClickOutside } from '@vueuse/core';
import KeyIcon from '~/components/icons/KeyIcon.vue';
import ListIcon from '~/components/icons/ListIcon.vue';
import CloseIcon from '~/components/icons/CloseIcon.vue';
import SignOutIcon from '~/components/icons/SignOutIcon.vue';
import { ref, watch, onUnmounted, defineAsyncComponent } from 'vue';
import type { Nullable } from '@depthbomb/common/typing';

const UsersIcon = defineAsyncComponent(() => import('~/components/icons/UsersIcon.vue'));

const sidebar = ref<Nullable<HTMLElement>>(null);
const drawerOpen = ref<boolean>(false);

const { username, avatars, isAdmin } = storeToRefs(useUserStore());

const logOut = async () => {
	await fetch('/oidc/invalidate', { method: 'POST' });
	window.location.href = '/';
};

const toggleDrawer = () => {
	drawerOpen.value = !drawerOpen.value;
};

const closeDrawer = () => {
	drawerOpen.value = false;
};

watch(drawerOpen, open => {
	document.body.classList.toggle('is-locked', open);
});

onClickOutside(sidebar, () => {
	if (drawerOpen.value) closeDrawer();
});

onUnmounted(() => {
	document.body.classList.remove('is-locked');
});
</script>

<template>
	<aside class="UserDrawer">
		<button class="UserDrawer-activator" type="button" @click="toggleDrawer">
			<img :alt="username" :src="avatars.x24" height="24" loading="lazy" width="24">
			<span>{{ username }}</span>
		</button>
		<div v-if="drawerOpen" class="UserDrawer-overlay">
			<div ref="sidebar" class="UserDrawer-sidebar">
				<header class="UserDrawer-sidebar-header">
					<div class="UserDrawer-user">
						<img :alt="username" :src="avatars.x32" height="32" loading="lazy" width="32">
						<span>{{ username }}</span>
					</div>
					<div class="UserDrawer-close-button">
						<button aria-label="Close user menu" type="button" @click="closeDrawer">
							<close-icon class="w-4 h-4" />
						</button>
					</div>
				</header>
				<!--
					Just close the sidebar whenever anything within this container is clicked until
					I come up with a more thorough solution.
				-->
				<div class="UserDrawer-sidebar-links" role="list" @click="closeDrawer">
					<template v-if="isAdmin">
						<router-link :to="{ name: 'admin.shortlinks' }" role="listitem">
							<list-icon />
							Shortlinks
						</router-link>
						<router-link :to="{ name: 'admin.users' }" role="listitem">
							<users-icon />
							Users
						</router-link>
						<hr role="separator">
					</template>
					<router-link :to="{ name: 'user-shortlinks' }" role="listitem">
						<list-icon />
						My Shortlinks
					</router-link>
					<router-link :to="{ name: 'api-key' }" role="listitem">
						<key-icon />
						API Key
					</router-link>
					<hr role="separator">
					<button class="is-danger" role="button" @click="logOut">
						<sign-out-icon />
						Sign Out
					</button>
				</div>
			</div>
		</div>
	</aside>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.UserDrawer {
	.UserDrawer-activator {
		@apply flex items-center;
		@apply py-1 px-1.5;
		@apply gap-2;
		@apply text-gray-300;
		@apply bg-transparent;
		@apply rounded;
		@apply transition-colors;

		@apply hover:text-white hover:bg-gray-700;
		@apply active:text-white active:bg-gray-600;

		img {
			@apply size-6;
			@apply rounded-full;
		}
	}

	.UserDrawer-overlay {
		@apply fixed;
		@apply top-0 right-0 bottom-0 left-0;
		@apply flex justify-end items-center;
		@apply h-screen;
		@apply bg-black/25;
		@apply backdrop-blur-[2px];
		@apply z-512;

		.UserDrawer-sidebar {
			@apply p-4;
			@apply min-w-[256px];
			@apply h-screen;
			@apply bg-gray-800;
			@apply rounded-l-xl;
			@apply shadow-lg;
			@apply animate-slide-in-left;

			.UserDrawer-sidebar-header {
				@apply grid grid-cols-2 grid-rows-1;

				.UserDrawer-user {
					@apply flex items-center grow;
					@apply space-x-3;
					@apply w-full;

					img {
						@apply size-8;
						@apply rounded-full;
					}
				}

				.UserDrawer-close-button {
					@apply flex items-center justify-end;

					button {
						@apply p-1.5;
						@apply text-gray-300;
						@apply bg-transparent;
						@apply rounded;
						@apply transition-colors;

						@apply hover:text-white;
						@apply hover:bg-gray-700;
						@apply active:bg-gray-600;
					}
				}
			}

			.UserDrawer-sidebar-links {
				@apply mt-3;
				@apply flex flex-col items-stretch;
				@apply space-y-2;

				a,
				button {
					@apply py-1.5 px-3;
					@apply flex flex-row items-center;
					@apply text-sm text-gray-300;
					@apply rounded;
					@apply cursor-pointer!;
					@apply transition-colors;

					@apply hover:text-white hover:bg-gray-700;
					@apply active:text-white active:bg-gray-600;

					&.is-danger {
						@apply hover:bg-red-600;
						@apply active:text-white active:bg-red-500;
					}

					&.is-active {
						@apply text-white;
						@apply bg-brand-700;
					}

					svg {
						@apply mr-2;
						@apply w-4 h-4;
					}
				}

				hr {
					@apply h-px;
					@apply bg-gray-700;
					@apply border-0;
				}
			}
		}
	}
}
</style>
