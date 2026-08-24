<script lang="ts" setup>
import QuoteIcon from '~/components/icons/QuoteIcon.vue';
</script>

<template>
	<h1 class="flex items-center mb-3 p-3 text-xl font-bold bg-gray-700 rounded-[10px]">
		<quote-icon class="mr-3 w-6 h-6 text-gray-500" placement="left" />
		<span>
			<slot />
		</span>
		<quote-icon class="ml-auto w-6 h-6 text-gray-500" placement="right" />
	</h1>
</template>
