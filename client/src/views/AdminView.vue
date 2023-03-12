<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import AppCard from '~/components/AppCard.vue';
	import { makeApiRequest } from '~/services/api';
	import LinksList from '~/components/LinksList.vue';
	import AppHeading from '~/components/AppHeading.vue';
	import type { IAjaxUserLink } from '~/@types/IAjaxUserLink';

	const allLinks    = ref<IAjaxUserLink[]>([]);
	const linksLoaded = ref(false);

	const getAllLinks = async () => {
		const links = await makeApiRequest<IAjaxUserLink[]>('/ajax/get-all-links', { method: 'POST' });

		allLinks.value    = links;
		linksLoaded.value = true;
	};

	onMounted(async () => await getAllLinks());
</script>

<template>
	<div class="container">
		<app-heading>Admin</app-heading>
		<app-card seamless bordered>
			<links-list
				:links="allLinks"
				:links-loaded="linksLoaded"
				@link-deleted="getAllLinks()"
				loading-message="Loading all shortlinks&hellip;"
				no-results-message="Looks like no one has created any shortlinks ¯\_(ツ)_/¯"
			/>
		</app-card>
	</div>
</template>
