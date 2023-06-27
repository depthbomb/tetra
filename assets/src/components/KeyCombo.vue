<script setup lang="ts">
	import type { Component } from 'vue';

	defineProps<{
		keys: Array<string|Component>
	}>();
</script>

<template>
	<div class="KeyCombo">
		<span v-for="key in keys" class="KeyCombo-bind">{{ key }}</span>
	</div>
</template>

<style scoped lang="scss">
	.KeyCombo {
		@apply relative;
		@apply inline-flex;
		@apply space-x-0.5;
		@apply translate-y-[-1px];

		.KeyCombo-bind {
			@apply py-0.5 px-1.5;
			@apply min-w-[1rem];
			@apply min-h-[1rem];
			@apply text-gray-100 text-xs text-center font-mono uppercase;
			@apply bg-gray-600;
			@apply border border-gray-950;
			@apply popup-gray-800;
			@apply rounded;
			@apply select-none;
			@apply cursor-default;

			@apply active:text-gray-400;
			@apply active:popup-depressed-gray-800;
			@apply active:translate-y-[2px];
		}
	}
</style>
