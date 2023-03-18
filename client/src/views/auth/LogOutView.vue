<script setup lang="ts">
	import { onMounted } from 'vue';
	import AppCard from '~/components/AppCard.vue';
	import { makeAPIRequest } from '~/services/api';
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';

	onMounted(async () => {
		const { ok } = await makeAPIRequest('/auth/logout', { method: 'POST' });
		if (ok) {
			window.location.href = '/';
		}
	});
</script>

<template>
	<app-card class="mt-6 mx-auto max-w-lg">
		<div class="flex flex-col items-center justify-center">
			<spinner-icon class="w-12 h-12 animate-spin"/>
			<p class="mt-3 text-lg">Logging you out&hellip;</p>
		</div>
	</app-card>
</template>
