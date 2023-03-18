<script setup lang="ts">
	import { useKeyModifier } from '@vueuse/core';
	import AppCard from '~/components/AppCard.vue';
	import { makeAPIRequest } from '~/services/api';
	import AppHeading from '~/components/AppHeading.vue';
	import ActionButton from '~/components/ActionButton.vue';
	import { ref, onMounted, defineAsyncComponent } from 'vue';
	import type { IAjaxUserLink } from '~/@types/IAjaxUserLink';

	const RocketIcon = defineAsyncComponent(() => import('~/components/icons/RocketIcon.vue'));

	const shiftKeyState = useKeyModifier('Shift');
	const allLinks      = ref<IAjaxUserLink[]>([]);

	const getAllLinks = async () => {
		const { getJSON } = await makeAPIRequest<IAjaxUserLink[]>('/ajax/get-all-links', { method: 'POST' });
		const links       = await getJSON();

		allLinks.value = links;
	};

	const deleteLink = async (shortcode: string, deletionKey: string) => {
		if (shiftKeyState.value === true || confirm('Are you sure you want to delete this shortlink?\nThis cannot be undone.')) {
			const { ok } = await makeAPIRequest(`/api/links/${shortcode}/${deletionKey}`, { method: 'DELETE' });
			if (ok) {
				await getAllLinks();
			}
		}
	};

	onMounted(async () => await getAllLinks());
</script>

<template>
	<div class="container container__fluid">
		<app-heading subheading="Hold SHIFT to enter quick delete mode">
			<span>All Shortlinks</span>
			<rocket-icon v-if="shiftKeyState === true" class="ml-2 h-8 text-brand"/>
		</app-heading>
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
	</div>
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
