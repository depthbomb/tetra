<script setup lang="ts">
	import { useTetraStore } from '~/stores/tetra';
	import LinkButton from '~/components/LinkButton.vue';

	const { username, avatar } = useTetraStore();
</script>

<template>
	<header class="masthead">
		<div class="masthead__title">
			<router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
		</div>
		<div class="masthead__links">
			<router-link :to="{ name: 'home' }" active-class="masthead__link--active">Home</router-link>
		</div>
		<a class="masthead__user">
			<div class="masthead__dropdown">
				<span class="masthead__avatar">
					<img :src="avatar" :alt="username">
				</span>
				<span class="masthead__username">{{ username }}</span>
			</div>
			<link-button variant="danger" size="small" to="/auth/logout">Sign Out</link-button>
		</a>
	</header>
</template>

<style scoped lang="scss">
	.masthead {
		@apply flex flex-row items-center;
		@apply px-8;
		@apply w-full h-14;
		@apply bg-gradient-to-b from-gray-800 to-gray-900;
		@apply border-b border-black;
		@apply shadow-lg;

		.masthead__title {
			@apply mr-8;
			@apply font-serif text-2xl text-gray-50;
		}

		.masthead__links {
			@apply flex flex-row items-center;
			@apply space-x-4;

			a {
				@apply text-gray-300;
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
