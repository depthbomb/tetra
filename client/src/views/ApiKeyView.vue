<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useClipboard } from '@vueuse/core';
	import AppCard from '~/components/AppCard.vue';
	import { makeAPIRequest } from '~/services/api';
	import AppHeading from '~/components/AppHeading.vue';
	import ActionButton from '~/components/ActionButton.vue';
	import type { IAjaxApiKeyResponse } from '~/@types/IAjaxApiKeyResponse';

	const apiKey                  = ref('Retrieving');
	const canRegenerate           = ref(false);
	const apiKeyCopied            = ref(false);
	const regenerateButtonClicked = ref(false);
	const { copy }                = useClipboard({ legacy: true });

	const retrieveApiKey = async () => {
		const { getJSON } = await makeAPIRequest<IAjaxApiKeyResponse>('/ajax/api-key', { method: 'POST' });
		const data        = await getJSON();

		apiKey.value        = data.apiKey;
		canRegenerate.value = data.canRequestNewKey;
	};

	const copyApiKey = () => {
		copy(apiKey.value);

		if (!apiKeyCopied.value) {
			apiKeyCopied.value = true;
			setTimeout(() => apiKeyCopied.value = false, 500);
		}
	};

	const regenerateApiKey = async () => {
		regenerateButtonClicked.value = true;
		const { ok } = await makeAPIRequest('/ajax/regenerate-api-key', { method: 'POST' });
		if (ok) {
			await retrieveApiKey();
		}

		regenerateButtonClicked.value = false;
	};

	onMounted(async () => await retrieveApiKey());
</script>

<template>
	<div class="container">
		<app-heading>Your API Key</app-heading>
		<app-card>
			<div class="my-12 space-x-4 flex flex-col justify-center items-center">
				<p :class="['text-2xl text-center font-mono cursor-pointer transition-colors', {
					'text-brand': !apiKeyCopied,
					'text-lime-500': apiKeyCopied
				}]"
				v-tooltip="'Click to copy'"
				@click="copyApiKey"
				>{{ apiKey }}</p>
				<p v-if="canRegenerate">
					<action-button variant="brand" @click="regenerateApiKey" :disabled="regenerateButtonClicked">Regenerate API Key</action-button>
				</p>
				<p v-else class="text-red-500">You've recently generated an API key. Please wait before generating a new one.</p>
			</div>
			<p>Creating shortlinks with an API key is only required if you want to be able to manage your shortlinks through this website. Otherwise, you do not need an API key and can choose to manage them through your own means with our API.</p>
			<p>Should you need a new API key, you can request a new one be generated once per hour.</p>
		</app-card>
	</div>
</template>
