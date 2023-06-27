<script setup lang="ts">
	import { onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import AppLoader from '~/components/AppLoader.vue';
	import { useConfig } from '~/composables/useConfig';

	const { authToken } = useConfig();

	onMounted(async () => {
		const { success } = await useApi('/oidc/invalidate', { method: 'POST', headers: { 'X-Csrf-Token': authToken } });
		if (success.value) {
			window.location.href = '/';
		}
	});
</script>

<template>
	<app-loader text="Logging you out&hellip;"/>
</template>
