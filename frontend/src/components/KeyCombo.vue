<script lang="ts" setup>
defineProps<{
	keys: readonly string[];
}>();
</script>

<template>
	<span class="KeyCombo">
		<kbd v-for="(key, index) in keys" :key="`${key}-${index}`" class="KeyCombo-bind">{{ key }}</kbd>
	</span>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.KeyCombo {
	@apply relative;
	@apply inline-flex;
	@apply space-x-0.5;
	@apply -translate-y-px;

	.KeyCombo-bind {
		@apply py-0.5 px-1.5;
		@apply min-w-4;
		@apply min-h-4;
		@apply text-gray-100 text-xs text-center font-mono uppercase;
		@apply bg-gray-600;
		@apply border border-gray-950;
		@apply popup-gray-800;
		@apply rounded;
		@apply select-none;
		@apply cursor-default;

		@apply active:text-gray-400;
		@apply active:popup-depressed-gray-800;
		@apply active:translate-y-0.5;
	}
}
</style>
