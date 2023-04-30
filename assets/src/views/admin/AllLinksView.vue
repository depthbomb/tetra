<script setup lang="ts">
	import { useKeyModifier } from '@vueuse/core';
	import { useApi } from '~/composables/useApi';
	import { ref, onMounted, defineAsyncComponent } from 'vue';

	const RocketIcon = defineAsyncComponent(() => import('~/components/icons/RocketIcon.vue'));

	const shiftKeyState = useKeyModifier('Shift');
	const allLinks      = ref<any[]>([]);

	const getAllLinks = async () => {
		const { getJSON } = await useApi<any[]>('/api/get-all-links', { method: 'POST' });
		const links       = await getJSON();

		allLinks.value = links;
	};

	const deleteLink = async (shortcode: string, deletionKey: string) => {
		if (shiftKeyState.value === true || confirm('Are you sure you want to delete this shortlink?\nThis cannot be undone.')) {
			const { ok } = await useApi(`/api/links/${shortcode}/${deletionKey}`, { method: 'DELETE' });
			if (ok) {
				await getAllLinks();
			}
		}
	};

	onMounted(async () => await getAllLinks());
</script>

<template>
	<h2 class="text-h2">All Shortlinks <rocket-icon v-if="shiftKeyState === true" class="ml-2 h-8 text-brand"/></h2>
	<p>Hold SHIFT for quick delete mode</p>
	<app-card seamless bordered>
		<table class="admin-links">
			<thead>
				<tr>
					<th>Controls</th>
					<th>Shortcode</th>
					<th>Destination</th>
					<th>Creator</th>
					<th>Created</th>
					<th>Expires</th>
				</tr>
			</thead>
			<tbody>
				<tr :id="`shortlink_${link.shortcode}`" v-key="link.shortcode" v-for="link in allLinks">
					<td>
						<action-button variant="danger" size="small" @click.prevent="deleteLink(link.shortcode, link.deletionKey)">Delete</action-button>
					</td>
					<td>{{ link.shortcode }}</td>
					<td>{{ link.destination }}</td>
					<td v-if="link.user.anonymous">Anonymous ({{ link.creatorIp }})</td>
					<td v-else>{{ link.user.username }}</td>
					<td>{{ link.createdAt }}</td>
					<td>{{ link.expiresAt ?? 'Never expires' }}</td>
				</tr>
			</tbody>
		</table>
	</app-card>
</template>

<style scoped lang="scss">
	.admin-links {
		@apply w-full;
		@apply table-auto;

		thead {
			@apply rounded;
			@apply bg-gray-900;

			th {
				@apply font-serif;
			}
		}

		tbody tr {
			@apply even:bg-gray-700;
		}

		th, td {
			@apply py-2 px-4;
			@apply text-left;
		}
	}
</style>
