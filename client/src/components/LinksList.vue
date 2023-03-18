<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import Loader from '~/components/Loader.vue';
	import Snippet from '~/components/Snippet.vue';
	import { UseTimeAgo } from '@vueuse/components';
	import { makeAPIRequest } from '~/services/api';
	import CopyButton from '~/components/CopyButton.vue';
	import TrashIcon from '~/components/icons/TrashIcon.vue';
	import ActionButton from '~/components/ActionButton.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import ArrowRightIcon from '~/components/icons/ArrowRightIcon.vue';
	import type { IAjaxUserLink } from '~/@types/IAjaxUserLink';

	const TimerIcon = defineAsyncComponent(() => import('~/components/icons/TimerIcon.vue'));

	withDefaults(defineProps<{
		linksLoaded: boolean;
		links: IAjaxUserLink[];
		loadingMessage: string;
		noResultsMessage: string;
	}>(), {
		loadingMessage: 'Loading shortlinks&hellip;',
		noResultsMessage: 'No shortlinks to display'
	});

	const emit = defineEmits(['linkDeleted']);

	const { truncate } = useTruncation();

	const deleteLink = async (shortcode: string, deletionKey: string) => {
		if (confirm('Are you sure you want to delete this shortlink?\nThis cannot be undone.')) {
			const { ok } = await makeAPIRequest(`/api/links/${shortcode}/${deletionKey}`, { method: 'DELETE' });

			if (ok) {
				emit('linkDeleted');
			}
		}
	};
</script>

<template>
	<div v-if="!linksLoaded">
		<loader :message="loadingMessage" class="my-8"/>
	</div>
	<div v-else class="user-links">
		<div v-key="link.shortcode" v-if="links.length" v-for="link in links" class="user-links__entry">
			<action-button variant="danger" size="small" @click.prevent="deleteLink(link.shortcode, link.deletionKey)" class="mr-2">
				<trash-icon class="h-4"/>
			</action-button>
			<copy-button :text="link.shortcode" :content="link.shortlink"/>
			<arrow-right-icon class="mx-4 h-6 text-gray-400"/>
			<snippet v-tooltip="{
				content: link.destination,
				disabled: link.destination.length < 64
			}">{{ truncate(link.destination, 64) }}</snippet>
			<div v-if="link.user" class="flex items-center ml-auto">
				<p v-if="link.user.anonymous">Created anonymously</p>
				<p v-else>Created by {{ link.user.username }}</p>
			</div>
			<div v-if="link.expiresAt" class="flex items-center ml-auto">
				<timer-icon class="mr-2 h-4"/>
				<use-time-ago v-slot="{ timeAgo }" :time="link.expiresAt">Expires {{ timeAgo }}</use-time-ago>
			</div>
		</div>
		<p v-else class="my-8 text-center text-gray-500 text-xl">{{ noResultsMessage }}</p>
	</div>
</template>

<style scoped lang="scss">
	.user-links {
		@apply flex flex-col justify-start items-stretch;

		.user-links__entry {
			@apply flex items-center;
			@apply p-4;
			@apply text-white;

			@apply odd:bg-gray-900;
			@apply even:bg-gray-800;

			& + .user-links__entry {
				@apply border-t border-gray-600;
			}
		}
	}
</style>
