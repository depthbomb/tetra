<script setup lang="ts">
	defineProps<{ value: number }>();
</script>

<template>
	<div class="stat">
		<div class="stat__value">{{ value }}</div>
		<div class="stat__info">
			<h3>
				<slot name="title"/>
			</h3>
			<p>
				<slot name="subtitle"/>
			</p>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.stat {
		@apply flex flex-row justify-center items-center;
		@apply py-3 px-4;
		@apply w-full;
		@apply text-gray-400;
		@apply bg-gray-800;
		@apply border border-gray-600;
		@apply rounded;
		@apply shadow-lg;

		.stat__value {
			@apply mr-6;
			@apply text-6xl font-mono font-bold;
		}

		.stat__info {
			@apply flex flex-col justify-center;

			h3 {
				@apply text-2xl font-bold;
			}
		}
	}
</style>
