<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import AppLoader from '~/components/AppLoader.vue';

	type AllUsersResponse = Array<{
		username: string;
		avatar: string;
		admin: boolean;
	}>;

	const loading = ref<boolean>(true);
	const users   = ref<AllUsersResponse>([]);

	const getAllUsers = async () => {
		const { success, getJSON } = await useApi('/_private/admin/all-users', { method: 'POST' });

		if (success.value) {
			const links = await getJSON<AllUsersResponse>();

			users.value = links;
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
				@apply w-32 h-32;
				@apply rounded-lg;
			}

			p {
				@apply mt-2;
			}
		}
	}
</style>
