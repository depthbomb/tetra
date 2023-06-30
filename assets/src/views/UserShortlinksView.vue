<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import AppLoader from '~/components/AppLoader.vue';
	import UserShortlinksRow from '~/components/user-shortlinks/UserShortlinksRow.vue';
	import type { IUserShortlinksResponse } from '~/@types/IUserShortlinksResponse';

	const loading    = ref<boolean>(true);
	const shortlinks = ref<IUserShortlinksResponse[]>([]);

	const user   = useUser();
	const toasts = useToastStore();

	const retrieveShortlinks = async (page = 1) => {
		const { success, getJSON } = await useApi(`/api/v1/shortlinks?api_key=${user.apiKey}&page=${page}`, { method: 'GET' });
		if (success.value) {
			const shortlinksResponse = await getJSON<IUserShortlinksResponse[]>();

			shortlinks.value = shortlinksResponse;
		} else {
			toasts.createToast('error', 'Failed to retrieve your shortlinks.');
		}

		loading.value = false;
	};

	onMounted(retrieveShortlinks);
</script>

<template>
	<div v-if="shortlinks.length !== 0" class="Shortlinks">
		<user-shortlinks-row
			:key="shortlink.shortcode"
			:shortlink="shortlink"
			v-for="shortlink of shortlinks"
			@shortlink-deleted="retrieveShortlinks"/>
	</div>
	<template v-else>
		<app-loader v-if="loading" text="Loading your shortlinks&hellip;"/>
		<p v-else class="text-center text-lg text-gray-400">You have no shortlinks. Why not create some? <span class="ml-6 font-mono">\(=ω=.)/</span></p>
	</template>
</template>

<style scoped lang="scss">
	.Shortlinks {
		@apply flex flex-col;
		@apply space-y-3;
	}
</style>
