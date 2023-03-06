<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import AppCard from '~/components/AppCard.vue';
	import { makeApiRequest } from '~/services/api';
	import LinksList from '~/components/LinksList.vue';
	import AppHeading from '~/components/AppHeading.vue';
	import type { IInternalUserLink } from '~/@types/IInternalUserLink';

	const allLinks    = ref<IInternalUserLink[]>([]);
	const linksLoaded = ref(false);

	const getAllLinks = async () => {
		const links = await makeApiRequest<IInternalUserLink[]>('/internal/get-all-links', { method: 'POST' });

		allLinks.value    = links;
		linksLoaded.value = true;
	};

	onMounted(async () => await getAllLinks());
</script>

<template>
	<div class="container">
		<app-heading>Admin</app-heading>
		<app-card seamless bordered>
			<links-list :links="allLinks" :links-loaded="true" @link-deleted="getAllLinks()"/>
		</app-card>
	</div>
</template>

<style scoped lang="scss">

</style>
