<script setup lang="ts">
	import { computed } from 'vue';
	import { RouterLink, type RouteLocationRaw } from 'vue-router';

	const props = defineProps<{
		to?: RouteLocationRaw;
		variant?: 'brand' | 'success' | 'warning' | 'danger' | 'error';
		size?: 'normal' | 'small' | 'large';
	}>();

	const buttonClass = computed(() => ['Button', `is-${props.variant ?? 'brand'}`, {
		'is-small': props.size === 'small',
		'is-large': props.size === 'large',
	}]);

	const isExternalLink = () => typeof props.to === 'string' && props.to.startsWith('http');
	const isServerLink   = () => typeof props.to === 'string' && props.to.startsWith('/');
</script>

<template>
	<template v-if="to">
		<a v-if="isExternalLink() || isServerLink()" :href="to.toString()" :class="buttonClass">
			<slot/>
		</a>
		<router-link v-else :to="to" :class="buttonClass">
			<slot/>
		</router-link>
	</template>
	<template v-else>
		<button :class="buttonClass" type="button">
			<slot/>
		</button>
	</template>
</template>

<style scoped lang="scss">
.Button {
	@apply flex items-center justify-center;
	@apply py-1.5 px-4;
	@apply text-white;
	@apply rounded-full;
	@apply border;
	@apply cursor-pointer;
	@apply select-none;
	@apply transition-all;

	&:active {
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	@apply disabled:opacity-50;
	@apply disabled:cursor-not-allowed;

	&.is-brand {
		@apply bg-brand-600 border-brand-600;
		@apply hover:bg-brand-700;
		@apply active:bg-brand-800 active:border-brand-700;
	}

	&.is-success {
		@apply bg-green-600 border-green-600;
		@apply hover:bg-green-700;
		@apply active:bg-green-800 active:border-green-700;
	}

	&.is-warning {
		@apply bg-amber-600 border-amber-600;
		@apply hover:bg-amber-700;
		@apply active:bg-amber-800 active:border-amber-700;
	}

	&.is-danger,
	&.is-error {
		@apply bg-red-600 border-red-600;
		@apply hover:bg-red-700;
		@apply active:bg-red-800 active:border-red-700;
	}

	&.is-small {
		@apply min-h-[28px];
		@apply px-2 py-1;
		@apply text-[13px];
	}

	&.is-large {
		@apply px-5 py-2.5;
		@apply text-xl;
	}
}
</style>
