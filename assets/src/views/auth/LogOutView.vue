<script setup lang="ts">
	import { onMounted } from 'vue';
	import { useApi } from '~/composables/useApi';
	import { useBridge } from '~/composables/useBridge';
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';

	const bridge = useBridge();

	onMounted(async () => {
		const { ok } = await useApi('/oidc/invalidate', { method: 'POST', headers: { 'X-Csrf-Token': bridge.authToken } });
		if (ok) {
			window.location.href = '/';
		}
	});
</script>

<template>
	<div class="flex items-center justify-center space-x-3">
		<spinner-icon class="animate-spin w-6 h-6"/>
		<p class="text-xl">Logging you out&hellip;</p>
	</div>
</template>
