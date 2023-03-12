<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useUserStore } from '~/stores/user';
	import AppCard from '~/components/AppCard.vue';
	import { makeApiRequest } from '~/services/api';
	import AppHeading from '~/components/AppHeading.vue';
	import type { IAjaxApiKeyResponse } from '~/@types/IAjaxApiKeyResponse';

	const store = useUserStore();

	const userApiKey            = ref('One moment...');
	const retrievedSuccessfully = ref(false);
	const loaded                = ref(false);

	onMounted(async () => {
		if (!!store.apiKey) {
			userApiKey.value            = store.apiKey;
			retrievedSuccessfully.value = true;
			loaded.value                = true;
		} else {
			makeApiRequest<IAjaxApiKeyResponse>('/ajax/api-key', { method: 'POST' }).then(({ apiKey }) => {
				userApiKey.value            = apiKey;
				retrievedSuccessfully.value = true;
				loaded.value                = true;
			}).catch(err => {
				userApiKey.value            = 'There was a problem retrieving your API key';
				retrievedSuccessfully.value = false;
			});
		}
	})
</script>

<template>
	<div class="container">
		<app-heading>Your API Key</app-heading>
		<app-card>
			<p :class="['my-12 text-2xl text-center font-mono', {
				'text-lime-500': retrievedSuccessfully && loaded,
				'text-red-500': !retrievedSuccessfully && loaded,
			}]">{{ userApiKey }}</p>
			<p>Creating shortlinks with an API key is only required if you want to be able to manage your shortlinks through this website. Otherwise, you do not need an API key and can choose to manage them through your own means with our API.</p>
		</app-card>
	</div>
</template>
