<script setup lang="ts">
	import QuoteIcon from '~/components/icons/QuoteIcon.vue';
</script>

<template>
	<h1 class="QuestionHeader">
		<quote-icon class="mr-3 w-6 h-6 text-gray-500" placement="left"/>
		<span>
			<slot/>
		</span>
		<quote-icon class="ml-auto w-6 h-6 text-gray-500" placement="right"/>
	</h1>
</template>

<style scoped lang="scss">
	.QuestionHeader {
		@apply flex items-center;
		@apply mb-3;
		@apply p-3;
		@apply text-xl font-bold;
		@apply bg-gray-700;
		@apply rounded-full;
	}
</style>
