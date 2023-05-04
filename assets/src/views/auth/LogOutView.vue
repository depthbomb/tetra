<script setup lang="ts">
	import { onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import AppLoader from '~/components/AppLoader.vue';
	import { useBridge } from '~/composables/useBridge';

	const bridge = useBridge();

	onMounted(async () => {
		const { success } = await useApi('/oidc/invalidate', { method: 'POST', headers: { 'X-Csrf-Token': bridge.authToken } });
		if (success.value) {
			window.location.href = '/';
		}
	});
</script>

<template>
	<app-loader text="Logging you out&hellip;"/>
</template>
