<script setup lang="ts">
	import { ref } from 'vue';
	import createClient from 'openapi-fetch';
	import TimeAgo from '~/components/TimeAgo.vue';
	import { useToastStore } from '~/stores/toast';
	import AppButton from '~/components/AppButton.vue';
	import CopyButton from '~/components/CopyButton.vue';
	import TrashIcon from '~/components/icons/TrashIcon.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import ArrowLongIcon from '~/components/icons/ArrowLongIcon.vue';
	import type { paths, components } from '~/@types/openapi';

	type ListShortlinksSchema = components['schemas']['ListShortlinksResponse'];

	defineProps<{ shortlink: ListShortlinksSchema[number] }>();
	const emit = defineEmits(['shortlink-deleted']);

	const deleteLoading = ref<boolean>(false);

	const toasts       = useToastStore();
	const { truncate } = useTruncation();

	const { DELETE } = createClient<paths>();

	const deleteShortlink = async (shortcode: string, secret: string) => {
		if (!confirm('Are you sure you want to permanently delete this shortlink?')) {
			return;
		}

		const { error } = await DELETE('/api/v1/shortlinks/{shortcode}/{secret}', {
			params: {
				path: {
					shortcode,
					secret
				}
			}
		});

		if (error) {
			toasts.createToast('error', 'Failed to delete shortlink.', false, 3_000);
		} else {
			emit('shortlink-deleted');
			toasts.createToast('success', 'Shortlink deleted!', true);
		}
	};
</script>

<template>
	<div class="Shortlinks-entry">
		<div class="Shortlinks-controls">
			<app-button :loading="deleteLoading" variant="danger" size="small" @click="deleteShortlink(shortlink.shortcode, shortlink.secret)">
				<trash-icon class="mr-1.5 h-3"/> Delete
			</app-button>
			<copy-button size="small" :content="shortlink.shortlink" :text="shortlink.shortcode" class="font-mono"/>
		</div>
		<arrow-long-icon direction="right" class="mx-6 w-8 h-8 text-gray-500"/>
		<div class="Shortlinks-destination">{{ truncate(shortlink.destination, 50) }}</div>
		<div class="Shortlinks-hits">{{ shortlink.hits }} hit{{ shortlink.hits === 1 ? '' : 's' }}</div>
		<div class="Shortlinks-dates">
			<span>
				Created <time-ago :date="shortlink.createdAt"/>
			</span>
			<span v-if="shortlink.expiresAt">
				Expires <time-ago :date="shortlink.expiresAt"/>
			</span>
		</div>
	</div>
</template>

<style scoped lang="scss">
.Shortlinks-entry {
	@apply flex items-center;
	@apply py-1.5 px-2;
	@apply w-full;
	@apply bg-gray-950;
	@apply rounded-full;

	.Shortlinks-controls {
		@apply flex items-center;
		@apply gap-1.5;
	}

	.Shortlinks-destination {
		@apply text-lg font-mono;
	}

	.Shortlinks-hits {
		@apply ml-auto mr-6;
		@apply text-sm text-gray-500;
	}

	.Shortlinks-dates {
		@apply flex flex-col;
		@apply space-y-0.5;
		@apply text-sm text-gray-500;
	}
}
</style>
