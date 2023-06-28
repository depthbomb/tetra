<script setup lang="ts">
	import { computed } from 'vue';
	import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';
	import { RouterLink, type RouteLocationRaw } from 'vue-router';

	const { to, variant = 'brand', size = 'normal', loading, disabled } = defineProps<{
		to?:       RouteLocationRaw;
		variant?:  'brand' | 'success' | 'warning' | 'danger' | 'error';
		size?:     'normal' | 'small' | 'large';
		loading?:  boolean;
		disabled?: boolean;
	}>();

	const buttonClass = computed(() => ['Button', `is-${variant}`, {
		'is-small':    size === 'small',
		'is-large':    size === 'large',
		'is-disabled': disabled
	}]);
	const loaderClass = computed(() => ['animate-spin', {
		'w-4 h-4': size === 'normal' || size === 'small',
		'w-6 h-6': size === 'large',
	}]);

	const isExternalLink = () => typeof to === 'string' && to.startsWith('http');
	const isServerLink   = () => typeof to === 'string' && to.startsWith('/');
</script>

<template>
	<template v-if="to">
		<!--
			Swapping the href value on disabled is only a temporary fix to ensure that the link
			really doesn't take the user anywhere when clicked.
		-->
		<a v-if="isExternalLink() || isServerLink()" :href="disabled ? '#' : to.toString()" :class="buttonClass">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass"/>
			</span>
			<slot v-else/>
		</a>
		<router-link v-else :to="disabled ? '#' : to" :class="buttonClass">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass"/>
			</span>
			<slot v-else/>
		</router-link>
	</template>
	<template v-else>
		<button :class="buttonClass" type="button" :disabled="disabled">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass"/>
			</span>
			<slot/>
		</button>
	</template>
</template>

<style scoped lang="scss">
.Button {
	@apply relative;
	@apply flex items-center justify-center;
	@apply py-1.5 px-4;
	@apply min-w-max;
	@apply text-white;
	@apply rounded;
	@apply cursor-pointer;
	@apply select-none;
	@apply outline-none;
	@apply transition-all;

	&-loader {
		@apply absolute;
		@apply inset-0;
		@apply flex items-center justify-center;
		@apply w-full h-full;
		@apply rounded;
		@apply z-[5];
	}

	&.is-disabled {
		@apply opacity-50;
		@apply cursor-not-allowed;
	}

	&.is-brand {
		@apply bg-brand-600;
		@apply hover:bg-brand-700;
		@apply active:bg-brand-800;

		.Button-loader {
			@apply bg-brand-600;
		}
	}

	&.is-success {
		&,
		& .Button-loader {
			@apply bg-green-600;
			@apply hover:bg-green-700;
			@apply active:bg-green-800;
		}
	}

	&.is-warning {
		&,
		& .Button-loader {
			@apply bg-amber-600;
			@apply hover:bg-amber-700;
			@apply active:bg-amber-800;
		}
	}

	&.is-danger,
	&.is-error {
		&,
		& .Button-loader {
			@apply bg-red-600;
			@apply hover:bg-red-700;
			@apply active:bg-red-800;
		}
	}

	&.is-small {
		@apply min-h-[30px];
		@apply px-2 py-1;
		@apply text-[13px];
	}

	&.is-large {
		@apply px-5 py-2.5;
		@apply text-xl;
	}
}
</style>
