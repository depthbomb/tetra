<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import CopyButton from '~/components/CopyButton.vue';
	import RefreshIcon from '~/components/icons/RefreshIcon.vue';
	import type { IApiKeyStatusResponse } from '~/@types/IApiKeyStatusResponse';
	import type { IRegenerateApiKeyResponse } from '~/@types/IRegenerateApiKeyResponse';

	const apiKey           = ref('');
	const apiKeyHidden     = ref(true);
	const canRegenerateKey = ref(false);
	const regeneratingKey  = ref(false);

	const user = useUser();

	const regenerateKey = async () => {
		if (!canRegenerateKey.value) {
			return;
		}

		if (confirm('There is a one hour wait between generating new API keys.\n\nAre you sure you want to continue?')) {
			const { getJSON } = await useApi('/api/v1/users/regenerate-api-key', {
				body: JSON.stringify({ api_key: user.apiKey }),
				method: 'POST'
			}, regeneratingKey);
			const { api_key } = await getJSON<IRegenerateApiKeyResponse>();

			canRegenerateKey.value = false;
			apiKey.value           = api_key;
		}
	};

	onMounted(async () => {
		apiKey.value = user.apiKey;

		const { getJSON }                = await useApi(`/api/v1/users/api-key-status?api_key=${user.apiKey}`, { method: 'GET' });
		const { regeneration_available } = await getJSON<IApiKeyStatusResponse>();

		canRegenerateKey.value = regeneration_available;
	});
</script>

<template>
	<header class="ApiKeyHeader">
		<div class="ApiKeyHeader-input">
			<copy-button text="Copy" :content="apiKey"/>
			<input
				:value="apiKey"
				:type="apiKeyHidden ? 'password' : 'text'"
				readonly
				@mouseenter="apiKeyHidden = false"
				@mouseleave="apiKeyHidden = true">
			<app-button :loading="regeneratingKey" variant="danger" :disabled="!canRegenerateKey" @click="regenerateKey">
				<refresh-icon :class="['mr-2 w-4 h-4', { 'animate-spin': canRegenerateKey }]"/>
				<span>Regenerate</span>
			</app-button>
		</div>
	</header>

	<div class="MainCard-divider"></div>

	<p>As with any API key for any service, do not share it with anyone as it can be used to perform actions on your behalf. If you accidentally leaked your API key and need a new one then you can regenerate it. You must wait a while after regenerating your API key before you can regenerate a new one.</p>
</template>

<style scoped lang="scss">
	.ApiKeyHeader {

		.ApiKeyHeader-input {
			@apply flex items-center;
			@apply space-x-3;
			@apply p-1.5;
			@apply w-full;
			@apply bg-gray-900;
			@apply rounded;

			input {
				@apply w-full;
				@apply font-mono text-lg text-center;
				@apply bg-transparent;
				@apply outline-none;
			}

			.ApiKeyHeader-inputCopyButton {
				@apply p-3;
			}
		}
	}
</style>
