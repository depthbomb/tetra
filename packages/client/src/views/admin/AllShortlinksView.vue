<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import createClient from 'openapi-fetch';
	import { useUserStore } from '~/stores/user';
	import KeyCombo from '~/components/KeyCombo.vue';
	import AppButton from '~/components/AppButton.vue';
	import { useThrottleFn, useKeyModifier } from '@vueuse/core';
	import ShortlinkRow from '~/components/admin/ShortlinkRow.vue';
	import type { paths, components } from '~/@types/openapi';

	const firstLoad  = ref<boolean>(true);
	const loading    = ref<boolean>(true);
	const shortlinks = ref<components['schemas']['ListAllShortlinksResponse']>([]);

	const { apiKey }    = useUserStore();
	const shiftKeyState = useKeyModifier('Shift');

	const { GET } = createClient<paths>();

	const getAllShortlinks = useThrottleFn(async () => {
		if (!firstLoad.value && loading.value) {
			return;
		}

		loading.value = true;

		const { data, error } = await GET('/api/v1/shortlinks/all', {
			params: {
				query: {
					apiKey
				}
			}
		});

		if (!data || error) {

		} else {
			shortlinks.value = data;
		}

		loading.value = false;

		if (firstLoad.value) {
			firstLoad.value = false;
		}
	}, 1_500);

	onMounted(getAllShortlinks);
</script>

<template>
	<div class="flex items-center justify-between py-3">
		<p>Hold <key-combo :keys="['shift']"/> to bypass action confirmations</p>
		<app-button size="small" @click="getAllShortlinks" :loading="loading" :disabled="loading">Refresh</app-button>
	</div>
	<table class="AdminTable">
		<transition
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0">
			<div v-if="loading" class="AdminTable-loading-overlay">Loading&hellip;</div>
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
				<shortlink-row
					:key="sl.shortcode"
					v-for="sl in shortlinks"
					:shortlink="sl"
					:shift-key="shiftKeyState!"
					@shortlink-deleted="getAllShortlinks"/>
			</transition-group>
		</tbody>
	</table>
</template>

<style scoped lang="scss">
	.AdminTable {
		@apply relative;
		@apply w-full table table-auto;

		.AdminTable-loading-overlay {
			@apply absolute inset-0;
			@apply flex flex-col justify-center items-center;
			@apply size-full;
			@apply bg-black bg-opacity-25;
			@apply rounded-lg;
			@apply backdrop-blur-sm;
			@apply transition-opacity;
			@apply z-10;
		}

		thead {
			tr {
				@apply bg-gray-950;
			}

			th {
				@apply p-3;
				@apply text-left;

				@apply first:rounded-l-lg;
				@apply last:rounded-r-lg;
			}
		}
	}
</style>
