<script setup lang="ts">
	import { useUserStore } from '~/stores/user';
	import AppCard from '~/components/AppCard.vue';
	import { makeAPIRequest } from '~/services/api';
	import AppHeading from '~/components/AppHeading.vue';
	import LinkCreator from '~/components/home/LinkCreator.vue';
	import { ref, watchEffect, defineAsyncComponent } from 'vue';
	import type { IAjaxUserLink } from '~/@types/IAjaxUserLink';

	const LinksList = defineAsyncComponent(() => import('~/components/LinksList.vue'));

	const store       = useUserStore();
	const userLinks   = ref<IAjaxUserLink[]>([]);
	const linksLoaded = ref(false);

	const getUserLinks = async () => {
		// linksLoaded is only ever false once so the list doesn't distractingly go into the loading
		// state on every re-retrieval

		const { getJSON } = await makeAPIRequest<IAjaxUserLink[]>('/ajax/get-user-links', { method: 'POST' });
		const links      = await getJSON();

		userLinks.value   = links;
		linksLoaded.value = true;
	};

	watchEffect(async () => {
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
			<links-list
				v-if="store.loggedIn"
				:links="userLinks"
				:links-loaded="linksLoaded"
				@link-deleted="getUserLinks()"
				loading-message="Loading your shortlinks&hellip;"
				no-results-message="You have no shortlinks - why not create some?"
			/>
			<p v-else class="my-8 text-center text-white text-xl">Sign in to view</p>
		</app-card>
	</div>
</template>

<style scoped lang="scss">
	.banner {
		@apply flex flex-col justify-center items-center;
		@apply py-16;
		@apply w-full;
		@apply min-h-max;
		@apply bg-gradient-to-b from-gray-800 to-brand-800;
		@apply shadow-lg;

		.banner__container {
			@apply mx-auto;
			@apply w-full max-w-screen-lg;
		}
	}
</style>
