<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import createClient from 'openapi-fetch';
	import { useToastStore } from '~/stores/toast';
	import { useUser } from '~/composables/useUser';
	import AppButton from '~/components/AppButton.vue';
	import CopyButton from '~/components/CopyButton.vue';
	import RefreshIcon from '~/components/icons/RefreshIcon.vue';
	import type { paths } from '~/@types/openapi';

	const apiKey           = ref<string>('');
	const apiKeyHidden     = ref<boolean>(true);
	const canRegenerateKey = ref<boolean>(false);
	const regeneratingKey  = ref<boolean>(false);

	const user            = useUser();
	const { createToast } = useToastStore();

	const { GET, POST } = createClient<paths>();

	const regenerateKey = async () => {
		if (!canRegenerateKey.value) {
			return;
		}

		if (confirm('There is a two hour wait between generating new a API key.\n\nAre you sure you want to continue?')) {
			regeneratingKey.value = true;
			const { data, error } = await POST('/api/v1/users/regenerate_api_key', {
				body: {
					apiKey: user.apiKey
				}
			});

			if (error) {
				createToast('error', error.message, true, true, 5_000);
			} else {
				apiKey.value = data.apiKey;
			}

			canRegenerateKey.value = false;
			regeneratingKey.value  = false;
		}
	};

	onMounted(async () => {
		apiKey.value = user.apiKey;

		const { data, error } = await GET('/api/v1/users/api_key_info', {
			params: {
				query: {
					apiKey: user.apiKey
				}
			}
		});

		if (error) {
			createToast('error', error.message, true, true, 5_000);
		} else {
			canRegenerateKey.value = data.canRegenerate;
		}
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
			@apply bg-gray-950;
			@apply rounded-full;

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
