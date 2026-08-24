<script lang="ts" setup>
import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';

const { text = 'Loading…', size = 'large' } = defineProps<{
	text?: string;
	size?: 'small' | 'large';
}>();
</script>

<template>
	<div class="Loader">
		<spinner-icon :class="['animate-spin', size === 'small' ? 'size-4' : 'size-6']" />
		<p :class="size === 'small' ? 'text-base' : 'text-xl'">{{ text }}</p>
	</div>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.Loader {
	@apply flex items-center justify-center;
	@apply space-x-3;
	@apply my-3;
	@apply w-full;
	@apply text-gray-400;

}
</style>
