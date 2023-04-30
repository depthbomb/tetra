<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import { UseTimeAgo } from '@vueuse/components';
	import AppButton from '~/components/AppButton.vue';
	import CopyButton from '~/components/CopyButton.vue';
	import TrashIcon from '~/components/icons/TrashIcon.vue';
	import TimerIcon from '~/components/icons/TimerIcon.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import ArrowLongIcon from '~/components/icons/ArrowLongIcon.vue';
	import type { IUserShortlinksResponse } from '~/@types/IUserShortlinksResponse';

	const loading    = ref(true);
	const shortlinks = ref<IUserShortlinksResponse[]>([]);

	const user         = useUser();
	const toasts       = useToastStore();
	const { truncate } = useTruncation();

	const deleteShortlink = async (shortcode: string, secret: string) => {
		if (!confirm('Are you sure you want to permanently delete this shortlink?')) {
			return;
		}

		const { success } = await useApi(`/api/v1/shortlinks/${shortcode}/${secret}`, { method: 'DELETE' });
		if (success) {
			toasts.createToast('success', 'Shortlink deleted!');

			await retrieveShortlinks();
		} else {
			toasts.createToast('error', 'Failed to delete shortlinks');
		}
	};

	const retrieveShortlinks = async (page = 1) => {
		const { success, getJSON } = await useApi(`/api/v1/shortlinks?api_key=${user.apiKey}&page=${page}`, { method: 'GET' });
		if (success) {
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
		<div :key="shortlink.shortcode" v-for="shortlink of shortlinks" class="Shortlinks-entry">
			<app-button variant="danger" @click="deleteShortlink(shortlink.shortcode, shortlink.secret)">
				<trash-icon class="w-3.5 h-6"/>
			</app-button>
			<copy-button :content="shortlink.shortlink" :text="shortlink.shortcode"/>
			<arrow-long-icon direction="right" class="w-8 h-8 text-gray-500"/>
			<div class="Shortlinks-entryDestination">{{ truncate(shortlink.destination, 64) }}</div>
			<div v-if="shortlink.expires_at" class="Shortlinks-entryTtl">
				<timer-icon class="w-4 h-4"/>
				<span><use-time-ago v-slot="{ timeAgo }" :time="new Date(shortlink.expires_at)">Expires {{ timeAgo }}</use-time-ago></span>
			</div>
		</div>
	</div>
	<div v-else class="NoShortlinks">
		<p v-if="loading">Loading your shortlinks&hellip;</p>
		<p v-else>You have no shortlinks. Why not create some? <span class="font-mono">(─ω─.)</span></p>
	</div>
</template>

<style scoped lang="scss">
	.NoShortlinks {
		@apply text-center;

		p {
			@apply text-xl text-gray-400;
		}
	}

	.Shortlinks {
		@apply flex flex-col;
		@apply space-y-3;

		.Shortlinks-entry {
			@apply flex items-center;
			@apply space-x-3;
			@apply p-3;
			@apply w-full;
			@apply bg-gray-900;
			@apply rounded-3xl;
			@apply shadow;

			.Shortlinks-entryDestination {
				@apply text-lg font-mono;
			}

			.Shortlinks-entryTtl {
				@apply flex items-center;
				@apply space-x-3;
				@apply ml-auto #{!important};
				@apply text-gray-500;
			}
		}
	}
</style>
