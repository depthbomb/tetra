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

	const buttonClass = computed(() => ['Button', `Button--${variant}`, {
		'Button--small':    size === 'small',
		'Button--large':    size === 'large',
		'Button--disabled': disabled
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
		<a v-if="isExternalLink() || isServerLink()" :href="disabled ? '#' : to.toString()" :class="buttonClass" role="button">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass"/>
			</span>
			<slot v-else/>
		</a>
		<router-link v-else :to="disabled ? '#' : to" :class="buttonClass" role="button">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass"/>
			</span>
			<slot v-else/>
		</router-link>
	</template>
	<template v-else>
		<button :class="buttonClass" type="button" :disabled="disabled" role="button">
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
	@apply rounded-xl;
	@apply border border-transparent;
	@apply cursor-pointer;
	@apply select-none;
	@apply outline-none;
	@apply transition-colors;

	@apply [&:not(.Button--disabled)]:active:shadow-[inset_0_0.15rem_2px_hsla(0,_0%,_0%,_0.15)];

	&-loader {
		@apply absolute;
		@apply inset-0;
		@apply flex items-center justify-center;
		@apply w-full h-full;
		@apply rounded-xl;
		@apply z-[5];
	}

	&--disabled {
		@apply opacity-50;
		@apply cursor-not-allowed;
	}

	&--brand {
		&,
		.Button-loader {
			@apply bg-brand-700;
			@apply border-brand-700;

			@apply [&:not(.Button--disabled)]:hover:bg-brand-600;
			@apply [&:not(.Button--disabled)]:hover:border-brand-600;
		}
	}

	&--success {
		&,
		& .Button-loader {
			@apply bg-green-600;
			@apply border-green-600;

			@apply [&:not(.Button--disabled)]:hover:bg-green-500;
			@apply [&:not(.Button--disabled)]:hover:border-green-500;
		}
	}

	&--warning {
		&,
		& .Button-loader {
			@apply bg-yellow-600;
			@apply border-yellow-600;

			@apply [&:not(.Button--disabled)]:hover:bg-yellow-500;
			@apply [&:not(.Button--disabled)]:hover:border-yellow-500;
		}
	}

	&--danger,
	&--error {
		&,
		& .Button-loader {
			@apply bg-red-600;
			@apply border-red-600;

			@apply [&:not(.Button--disabled)]:hover:bg-red-500;
			@apply [&:not(.Button--disabled)]:hover:border-red-500;
		}
	}

	&--small {
		@apply min-h-[30px];
		@apply px-2 py-1;
		@apply text-[13px];
	}

	&--large {
		@apply px-5 py-2.5;
		@apply text-xl;
	}
}
</style>
