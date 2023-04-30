<script setup lang="ts">
	import { onMounted } from 'vue';
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';

	onMounted(async () => window.location.href = '/oidc/start');
</script>

<template>
	<div class="flex items-center justify-center space-x-3">
		<spinner-icon class="animate-spin w-6 h-6"/>
		<p class="text-xl">Redirecting&hellip;</p>
	</div>
</template>
