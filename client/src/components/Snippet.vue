<template>
	<code><slot/></code>
</template>

<style scoped lang="scss">
	code {
		@apply py-0.5 px-1;
		@apply text-sm text-brand-500;
		@apply bg-brand-700 bg-opacity-50;
		@apply rounded;
	}
</style>
