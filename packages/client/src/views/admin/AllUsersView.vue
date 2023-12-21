<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import createClient from 'openapi-fetch';
	import { useUserStore } from '~/stores/user';
	import { useToastStore } from '~/stores/toast';
	import AppLoader from '~/components/AppLoader.vue';
	import type { paths, components } from '~/@types/openapi';

	const loading = ref<boolean>(true);
	const users   = ref<components['schemas']['ListUsersResponse']>([]);

	const { apiKey }      = useUserStore();
	const { createToast } = useToastStore();

	const { GET } = createClient<paths>();

	const getAllUsers = async () => {
		const { data, error } = await GET('/api/v1/users', {
			params: {
				query: {
					apiKey
				}
			}
		});

		if (!data || error) {
			createToast('error', 'Failed to retrieve users.', false, 3_000);
		} else {
			users.value = data;
		}

		loading.value = false;
	};

	onMounted(getAllUsers);
</script>

<template>
	<app-loader v-if="loading"/>
	<div v-else class="UsersGrid">
		<div v-for="user in users" class="User-card">
			<img :src="user.avatar" :alt="user.username">
			<p>
				<span v-if="user.admin" class="mr-1.5 font-mono text-amber-500">[Admin]</span>
				<span>{{ user.username }}</span>
			</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.UsersGrid {
		@apply grid grid-cols-6 gap-3;
		@apply justify-center items-center;

		.User-card {
			@apply flex flex-col items-center;

			img {
				@apply size-32;
				@apply rounded-xl;
			}

			p {
				@apply mt-2;
			}
		}
	}
</style>
