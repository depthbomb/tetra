<script setup lang="ts">
	import { defineAsyncComponent } from 'vue';
	import { useApi } from '~/composables/useApi';
	import { useTruncation } from '~/composables/useTruncation';

	const TimerIcon = defineAsyncComponent(() => import('~/components/icons/TimerIcon.vue'));

	withDefaults(defineProps<{
		linksLoaded: boolean;
		links: any[];
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
			const { ok } = await useApi(`/api/v1/shortlinks/${shortcode}/${deletionKey}`, { method: 'DELETE' });

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
	<v-card v-else v-bind:key="link.shortcode" v-if="links.length" v-for="link in links" variant="tonal">
		<v-card-text>
			<v-row justify="start" align="center" class="space-x-4">
				<v-menu transition="scale-transition">
					<template v-slot:activator="{ props }">
						<v-btn icon="mdi-dots-vertical" size="small" v-bind="props" color="primary"/>
					</template>
					<v-list density="compact">
						<v-list-item prepend-icon="mdi-content-copy" title="Copy shortlink"/>
						<v-list-item prepend-icon="mdi-delete" title="Delete" @click.prevent="deleteLink(link.shortcode, link.deletion_key)"/>
					</v-list>
				</v-menu>
				<v-code>{{ link.shortlink }}</v-code>
				<v-icon icon="mdi-equal"/>
				<v-code>{{ truncate(link.destination, 64) }}</v-code>
			</v-row>
		</v-card-text>
	</v-card>
	<div class="user-links">
		<!-- <div v-bind:key="link.shortcode" v-if="links.length" v-for="link in links" class="user-links__entry">
			<v-menu transition="scale-transition" class="mr-4">
				<template v-slot:activator="{ props }">
					<v-btn icon="mdi-dots-vertical" size="small" v-bind="props"/>
				</template>
				<v-list density="compact">
					<v-list-item prepend-icon="mdi-content-copy" title="Copy shortlink"/>
					<v-list-item prepend-icon="mdi-delete" title="Delete" @click.prevent="deleteLink(link.shortcode, link.deletionKey)"/>
				</v-list>
			</v-menu>
			<v-code>{{ link.shortlink }}</v-code>
			<arrow-right-icon class="w-6 text-gray-400"/>
			<v-code>{{ truncate(link.destination, 64) }}</v-code>
			<div v-if="link.user" class="flex items-center ml-auto">
				<p v-if="link.user.anonymous">Created anonymously</p>
				<p v-else>Created by {{ link.user.username }}</p>
			</div>
			<div v-if="link.expiresAt" class="flex items-center ml-auto">
				<timer-icon class="mr-2 h-4"/>
				<use-time-ago v-slot="{ timeAgo }" :time="link.expiresAt">Expires {{ timeAgo }}</use-time-ago>
			</div>
		</div>
		<p v-else class="my-8 text-center text-gray-500 text-xl">{{ noResultsMessage }}</p> -->
	</div>
</template>

<style scoped lang="scss">

</style>
