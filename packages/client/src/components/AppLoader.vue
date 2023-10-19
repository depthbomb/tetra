<script setup lang="ts">
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';

	defineProps<{
		text?: string;
		size?: 'small' | 'large';
	}>();
</script>

<template>
	<div class="Loader">
		<spinner-icon class="animate-spin w-6 h-6"/>
		<p>{{ text ?? 'Loading&hellip;' }}</p>
	</div>
</template>

<style scoped lang="scss">
	.Loader {
		@apply flex items-center justify-center;
		@apply space-x-3;
		@apply my-3;
		@apply w-full;
		@apply text-gray-400;

		p {
			@apply text-xl;
		}
	}
</style>
