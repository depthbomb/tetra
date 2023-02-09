<script setup lang="ts">
	import CopyButton from './CopyButton.vue';
	import { defineAsyncComponent } from 'vue';
	import Loader from '~/components/Loader.vue';
	import { UseTimeAgo } from '@vueuse/components';
	import { makeApiRequest } from '~/services/api';
	import TrashIcon from '~/components/icons/TrashIcon.vue';
	import ActionButton from '~/components/ActionButton.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import ArrowRightIcon from '~/components/icons/ArrowRightIcon.vue';
	import type { IInternalUserLinks } from '@tetra/common';

	const TimerIcon = defineAsyncComponent(() => import('~/components/icons/TimerIcon.vue'));

	const props = defineProps<{
		linksLoaded: boolean,
		links: IInternalUserLinks[]
	}>();

	const emit = defineEmits(['linkDeleted']);

	const { truncate } = useTruncation();

	const deleteLink = async (shortcode: string, deletionKey: string) => {
		if (confirm('Are you sure you want to delete this shortlink? This cannot be undone.')) {
			await makeApiRequest(`/api/links/delete/${shortcode}/${deletionKey}`, { method: 'DELETE' });

			emit('linkDeleted');
		}
	};
</script>

<template>
	<div v-if="!linksLoaded">
		<loader message="Loading your links&hellip;" class="my-8"/>
	</div>
	<div v-else class="user-links">
		<div v-key="link.shortcode" v-if="links.length" v-for="link in links" class="user-links__entry">
			<action-button variant="danger" size="small" @click.prevent="deleteLink(link.shortcode, link.deletionKey)" class="mr-2">
				<trash-icon class="w-4 h-4"/>
			</action-button>
			<copy-button :text="link.shortcode" :content="link.shortlink"/>
			<arrow-right-icon class="mx-4 w-6 h-6 text-gray-400"/>
			<code>{{ truncate(link.destination, 100) }}</code>
			<div v-if="link.expiresAt" class="flex items-center ml-auto">
				<timer-icon class="mr-2 w-4 h-4"/>
				<use-time-ago v-slot="{ timeAgo }" :time="link.expiresAt">Expires {{ timeAgo }}</use-time-ago>
			</div>
		</div>
		<p v-else class="my-8 text-center text-white text-xl">You have no links, why not create some?</p>
	</div>
</template>

<style scoped lang="scss">
	.user-links {
		@apply flex flex-col justify-start items-stretch;

		.user-links__entry {
			@apply flex items-center;
			@apply p-4;
			@apply text-white;

			@apply odd:bg-gray-800;
			@apply even:bg-gray-900;
		}
	}
</style>
