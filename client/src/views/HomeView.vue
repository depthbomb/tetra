<script setup lang="ts">
	import { useTetraStore } from '~/stores/tetra';
	import AppCard from '~/components/AppCard.vue';
	import { makeApiRequest } from '~/services/api';
	import AppHeading from '~/components/AppHeading.vue';
	import { ref, onMounted, defineAsyncComponent } from 'vue';
	import LinkCreator from '~/components/home/LinkCreator.vue';
	import type { IInternalUserLink } from '~/@types/IInternalUserLink';

	const LinksList = defineAsyncComponent(() => import('~/components/LinksList.vue'));

	const store       = useTetraStore();
	const userLinks   = ref<IInternalUserLink[]>([]);
	const linksLoaded = ref(false);

	const getUserLinks = async () => {
		// linksLoaded is only ever false once so the list doesn't distractingly go into the loading state on every re-retrieval

		const links = await makeApiRequest<IInternalUserLink[]>('/internal/get-user-links', { method: 'POST' });

		userLinks.value   = links;
		linksLoaded.value = true;
	};

	onMounted(async () => {
		if (store.loggedIn) {
			await getUserLinks();
		}
	});
</script>

<template>
	<div class="banner">
		<div class="banner__container">
			<link-creator @link-created="getUserLinks()"/>
		</div>
	</div>
	<div class="mt-6 container">
		<app-heading>Your Shortlinks</app-heading>
		<app-card seamless bordered>
			<links-list v-if="store.loggedIn" :links="userLinks" :links-loaded="linksLoaded" @link-deleted="getUserLinks()"/>
			<p v-else class="my-8 text-center text-white text-xl">Sign in to view</p>
		</app-card>
	</div>
</template>

<style scoped lang="scss">
	.banner {
		@apply flex flex-col;
		@apply py-16;
		@apply w-full;
		@apply min-h-max;
		@apply bg-gradient-to-b from-gray-800 to-brand-800;

		.banner__container {
			@apply mx-auto;
			@apply w-full max-w-screen-lg;
		}
	}
</style>
