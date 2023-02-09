<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { makeApiRequest } from '~/services/api';
	import Masthead from '~/components/dashboard/Masthead.vue';
	import LinksList from '~/components/dashboard/LinksList.vue';
	import QuickLinkCreator from '~/components/dashboard/QuickLinkCreator.vue';
	import type { IInternalUserLinks } from '@tetra/common';

	const userLinks   = ref<IInternalUserLinks[]>([]);
	const linksLoaded = ref(false);

	const getUserLinks = async () => {
		linksLoaded.value = false;

		const links = await makeApiRequest<IInternalUserLinks[]>('/internal/get-user-links', { method: 'POST' });

		userLinks.value   = links;
		linksLoaded.value = true;
	};

	onMounted(async () => await getUserLinks());
</script>

<template>
	<masthead/>
	<div class="my-4 container">
		<div class="dashboard__panel">
			<quick-link-creator/>
		</div>
		<div class="panel panel--flushed">
			<div class="panel__header">
				My Links
			</div>
			<div class="panel__body">
				<links-list @link-deleted="getUserLinks" :links-loaded="linksLoaded" :links="userLinks"/>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	html, body {
		@apply bg-gray-800;
	}
</style>

<style scoped lang="scss">
	.container {
		@apply block;
		@apply mx-auto;
		@apply max-w-screen-xl w-full;
	}

	.panel {
		@apply block;
		@apply w-full;
		@apply bg-gray-700;
		@apply rounded;
		@apply border border-black;
		@apply shadow-lg;

		&.panel--flushed {

			.panel__body {
				@apply p-0;
			}
		}

		.panel__header {
			@apply px-4 py-2;
			@apply text-gray-200;
			@apply bg-gradient-to-b from-gray-800 to-gray-900;
			@apply border-b border-black;
			@apply rounded-t;
			@apply highlight-gray-700;
		}

		.panel__body {
			@apply p-4;
			@apply text-white;
		}

		& + & {
			@apply mt-12;
		}
	}
</style>
