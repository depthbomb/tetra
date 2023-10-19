<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import createClient from 'openapi-fetch';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import AppLoader from '~/components/AppLoader.vue';
	import UserShortlinksRow from '~/components/user-shortlinks/UserShortlinksRow.vue';
	import type { paths, components } from '~/@types/openapi';

	type ListShortlinksSchema = components['schemas']['ListShortlinksResponse'];

	const loading    = ref<boolean>(true);
	const shortlinks = ref<ListShortlinksSchema>([]);

	const user            = useUser();
	const { createToast } = useToastStore();

	const { GET } = createClient<paths>();

	const retrieveShortlinks = async () => {
		const { data, error } = await GET('/api/v1/shortlinks', {
			params: {
				query: {
					apiKey: user.apiKey
				}
			}
		});

		if (!data || error) {
			createToast('error', 'Failed to retrieve your shortlinks.')
		} else {
			shortlinks.value = data;
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
