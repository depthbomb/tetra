<script setup lang="ts">
	import { onMounted } from 'vue';
	import AppCard from '~/components/AppCard.vue';

	onMounted(async () => window.location.href = '/auth/login');
</script>

<template>
	<app-card class="mt-6 mx-auto max-w-lg">
		<div class="flex flex-col items-center justify-center">
			<p class="text-lg">Redirecting to login&hellip;</p>
		</div>
	</app-card>
</template>
