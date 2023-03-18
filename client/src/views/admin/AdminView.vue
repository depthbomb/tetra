<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useIntervalFn } from '@vueuse/shared';
	import { makeAPIRequest } from '~/services/api';
	import StatDisplay from '~/components/admin/StatDisplay.vue';
	import type { IAjaxAllStatsResponse } from '~/@types/IAjaxAllStatsResponse';

	const linksCount = ref(0);
	const usersCount = ref(0);

	onMounted(() => {
		useIntervalFn(async () => {
			const { getJSON } = await makeAPIRequest<IAjaxAllStatsResponse>('/ajax/all-stats', { method: 'POST' });
			const { totalLinks, totalUsers } = await getJSON();

			linksCount.value = totalLinks;
			usersCount.value = totalUsers;
		}, 5_000, { immediateCallback: true });
	});
</script>

<template>
	<div class="my-6 container">
		<div class="flex flex-row space-x-6">
			<stat-display title="Shortlinks" :value="linksCount">
				<template #title>
					Links
				</template>
				<template #subtitle>
					<router-link :to="{ name: 'admin.links' }">View all</router-link>
				</template>
			</stat-display>
			<stat-display title="Users" :value="usersCount">
				<template #title>
					Users
				</template>
				<template #subtitle>
					<router-link :to="{ name: 'admin.users' }">View all</router-link>
				</template>
			</stat-display>
		</div>
	</div>
	<div class="container container__fluid">
		<router-view/>
	</div>
</template>
