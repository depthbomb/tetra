<script setup lang="ts">
	defineProps<{
		subheading?: string;
		rule?: boolean;
	}>();
</script>

<template>
	<div class="app-heading">
		<h1><slot/></h1>
		<p v-if="subheading">{{ subheading }}</p>
		<div v-if="rule" class="app-heading__rule"/>
	</div>
</template>

<style scoped lang="scss">
	.app-heading {
		@apply my-6;

		h1 {
			@apply flex flex-row items-center;
			@apply text-4xl text-white font-serif;
		}

		p {
			@apply mt-2;
			@apply text-xl text-gray-400 font-serif;
		}

		&__rule {
			@apply pt-4;
			@apply border-b border-gray-600;
		}
	}
</style>
