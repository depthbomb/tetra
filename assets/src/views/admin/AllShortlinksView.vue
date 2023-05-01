<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useKeyModifier } from '@vueuse/core';
	import { useApi } from '~/composables/useApi';
	import AppButton from '~/components/AppButton.vue';
	import type { IAllShortlinksRecord } from '~/@types/IAllShortlinksRecord';

	type AllShortlinksResponse = IAllShortlinksRecord[];

	const loading    = ref(true);
	const shortlinks = ref<AllShortlinksResponse>([]);

	const shiftKeyState = useKeyModifier('Shift');

	const getAllShortlinks = async () => {
		loading.value = true;
		const { success, getJSON } = await useApi('/api/admin/all-shortlinks', { method: 'POST' });

		if (success) {
			const links = await getJSON<AllShortlinksResponse>();

			shortlinks.value = links;
		}

		loading.value = false;
	};

	const deleteLink = async (shortcode: string, deletionKey: string) => {
		if (shiftKeyState.value === true || confirm('Are you sure you want to delete this shortlink?\nThis cannot be undone.')) {
			loading.value = true;

			const { success } = await useApi(`/api/v1/shortlinks/${shortcode}/${deletionKey}`, { method: 'DELETE' });
			if (success) {
				await getAllShortlinks();
			}
		}
	};

	onMounted(getAllShortlinks);
</script>

<template>
	<div class="flex items-center justify-between py-3">
		<p>Hold SHIFT for <span :class="{ 'text-red-500': shiftKeyState }">quick delete mode</span></p>
		<app-button size="small" @click="getAllShortlinks">Refresh</app-button>
	</div>
	<table class="AdminTable">
		<transition
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0">
			<div v-if="loading" class="AdminTable-loadingOverlay">Loading&hellip;</div>
		</transition>
		<thead>
			<tr>
				<th class="rounded-l-xl">Controls</th>
				<th>Shortcode</th>
				<th>Destination</th>
				<th>Creator</th>
				<th>Created</th>
				<th>Expires</th>
			</tr>
		</thead>
		<tbody>
			<transition-group
				enter-active-class="transition duration-100 ease-out"
				enter-from-class="transform scale-95 opacity-0"
				enter-to-class="transform scale-100 opacity-100"
				leave-active-class="transition duration-75 ease-in"
				leave-from-class="transform scale-100 opacity-100"
				leave-to-class="transform scale-95 opacity-0">
				<tr :key="sl.shortcode" v-for="sl in shortlinks">
					<td>
						<app-button variant="danger" size="small" @click.prevent="deleteLink(sl.shortcode, sl.secret)">Delete</app-button>
					</td>
					<td>{{ sl.shortcode }}</td>
					<td>
						<p>
							<a :href="sl.destination" target="_blank">{{ sl.destination }}</a>
						</p>
					</td>
					<td>{{ sl.user_username ?? sl.creator_ip }}</td>
					<td>{{ sl.created_at }}</td>
					<td>{{ sl.expires_at ?? 'Never expires' }}</td>
				</tr>
			</transition-group>
		</tbody>
	</table>
</template>

<style scoped lang="scss">
	.AdminTable {
		@apply relative;
		@apply w-full table table-auto;

		.AdminTable-loadingOverlay {
			@apply absolute inset-0;
			@apply flex flex-col items-center justify-center;
			@apply w-full h-full;
			@apply bg-black bg-opacity-25;
			@apply rounded-xl;
			@apply backdrop-blur-sm;
			@apply transition-opacity;
		}

		thead {

			tr {
				@apply bg-gray-900;
			}

			th {
				@apply p-3;
				@apply text-left;

				@apply first:rounded-l-xl;
				@apply last:rounded-r-xl;
			}
		}

		tbody {

			td {
				@apply p-3;
			}
		}
	}
</style>
