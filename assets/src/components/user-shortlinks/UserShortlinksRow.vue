<script setup lang="ts">
	import { ref } from 'vue';
	import { useApi } from '~/composables/useApi';
	import TimeAgo from '~/components/TimeAgo.vue';
	import { useToastStore } from '~/stores/toast';
	import AppButton from '~/components/AppButton.vue';
	import KeyIcon from '~/components/icons/KeyIcon.vue';
	import CopyButton from '~/components/CopyButton.vue';
	import TrashIcon from '~/components/icons/TrashIcon.vue';
	import { useTruncation } from '~/composables/useTruncation';
	import ArrowLongIcon from '~/components/icons/ArrowLongIcon.vue';
	import type { IUserShortlinksResponse } from '~/@types/IUserShortlinksResponse';

	defineProps<{ shortlink: IUserShortlinksResponse }>();
	const emit = defineEmits(['shortlink-deleted']);

	const deleteLoading = ref(false);

	const toasts       = useToastStore();
	const { truncate } = useTruncation();

	const deleteShortlink = async (shortcode: string, secret: string) => {
		if (!confirm('Are you sure you want to permanently delete this shortlink?')) {
			return;
		}

		const { success } = await useApi(`/api/v1/shortlinks/${shortcode}/${secret}`, { method: 'DELETE' }, deleteLoading);
		if (success.value) {
			emit('shortlink-deleted');
			toasts.createToast('success', 'Shortlink deleted!');
		} else {
			toasts.createToast('error', 'Failed to delete shortlink');
		}
	};
</script>

<template>
	<div class="Shortlinks-entry">
		<div class="Shortlinks-entryControls">
			<app-button :loading="deleteLoading" variant="danger" size="small" @click="deleteShortlink(shortlink.shortcode, shortlink.secret)">
				<trash-icon class="mr-1.5 h-3"/> Delete
			</app-button>
			<copy-button size="small" :content="shortlink.shortlink" :text="shortlink.shortcode" class="font-mono"/>
			<copy-button size="small" :icon="KeyIcon" :content="shortlink.secret" text="Secret"/>
		</div>
		<arrow-long-icon direction="right" class="mx-6 w-8 h-8 text-gray-500"/>
		<div class="Shortlinks-entryDestination">{{ truncate(shortlink.destination, 50) }}</div>
		<div class="Shortlinks-entryDates">
			<p>
				Created <time-ago :date="shortlink.created_at"/>
			</p>
			<p v-if="shortlink.expires_at">
				Expires <time-ago :date="shortlink.expires_at"/>
			</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
.Shortlinks-entry {
	@apply flex items-center;
	@apply p-1.5;
	@apply w-full;
	@apply bg-gray-950;
	@apply rounded;

	.Shortlinks-entryControls {
		@apply flex items-center;
		@apply space-x-1.5;
	}

	.Shortlinks-entryDestination {
		@apply text-lg font-mono;
	}

	.Shortlinks-entryDates {
		@apply flex flex-col;
		@apply ml-auto mr-3;
		@apply mr-3;
		@apply space-y-0.5;
		@apply text-gray-500;

		p {
			@apply text-sm text-right;
		}
	}
}
</style>
