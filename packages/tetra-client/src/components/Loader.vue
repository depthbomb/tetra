<script setup lang="ts">
	import SpinnerIcon from './icons/SpinnerIcon.vue';

	defineProps<{
		message?: string;
	}>();
</script>

<template>
	<div class="loader">
		<spinner-icon class="w-6 h-6 animate-spin"/>
		<span>{{ message ?? 'Loading&hellip;' }}</span>
	</div>
</template>

<style scoped lang="scss">
	.loader {
		@apply flex flex-row items-center justify-center;
		@apply space-x-2;
		@apply w-full;
		@apply text-white;
	}
</style>
