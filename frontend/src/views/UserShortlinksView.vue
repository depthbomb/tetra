<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import createClient from 'openapi-fetch';
import { useUserStore } from '~/stores/user';
import { useToastStore } from '~/stores/toast';
import AppLoader from '~/components/AppLoader.vue';
import UserShortlinksRow from '~/components/user-shortlinks/UserShortlinksRow.vue';
import type { components, paths } from '~/@types/openapi';

type ListShortlinksSchema = components['schemas']['ListShortlinksResponse'];

const loading = ref<boolean>(true);
const shortlinks = ref<ListShortlinksSchema>([]);

const { apiKey } = storeToRefs(useUserStore());
const { createToast } = useToastStore();

const { GET } = createClient<paths>();

const retrieveShortlinks = async () => {
	const { data, error } = await GET('/api/v1/shortlinks', {
		params: {
			query: {
				apiKey: apiKey.value
			}
		}
	});

	if (!data || error) {
		createToast('error', 'Failed to retrieve your shortlinks.', false, 3_000)
	} else {
		shortlinks.value = data;
	}

	loading.value = false;
};

onMounted(retrieveShortlinks);
</script>

<template>
	<div v-if="shortlinks.length !== 0" class="Shortlinks">
		<user-shortlinks-row v-for="shortlink of shortlinks" :key="shortlink.shortcode" :shortlink="shortlink"
			@shortlink-deleted="retrieveShortlinks" />
	</div>
	<template v-else>
		<app-loader v-if="loading" text="Loading your shortlinks&hellip;" />
		<p v-else class="text-center text-lg text-gray-400">You have no shortlinks. Why not create some? <span
				class="ml-6 font-mono">\(=ω=.)/</span></p>
	</template>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.Shortlinks {
	@apply flex flex-col;
	@apply space-y-3;
}
</style>
