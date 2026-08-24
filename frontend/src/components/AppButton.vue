<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import SpinnerIcon from '~/components/icons/SpinnerIcon.vue';
import type { RouteLocationRaw } from 'vue-router';

const { to, variant = 'brand', size = 'normal', loading, disabled } = defineProps<{
	to?: RouteLocationRaw;
	variant?: 'brand' | 'success' | 'warning' | 'danger' | 'error';
	size?: 'xsmall' | 'small' | 'normal' | 'large';
	loading?: boolean;
	disabled?: boolean;
}>();

const buttonClass = computed(() => ['Button', `Button--${variant}`, {
	'Button--xsmall': size === 'xsmall',
	'Button--small': size === 'small',
	'Button--large': size === 'large',
	'Button--disabled': disabled || loading
}]);
const loaderClass = computed(() => ['animate-spin', {
	'w-3 h-3': size === 'xsmall',
	'w-4 h-4': size === 'normal' || size === 'small',
	'w-6 h-6': size === 'large',
}]);

const isExternalLink = computed(() => typeof to === 'string' && /^https?:\/\//.test(to));
const isServerLink = computed(() => typeof to === 'string' && to.startsWith('/'));
const isDisabled = computed(() => Boolean(disabled || loading));

const preventDisabledNavigation = (event: MouseEvent) => {
	if (isDisabled.value) event.preventDefault();
};
</script>

<template>
	<template v-if="to">
		<a v-if="isExternalLink || isServerLink" :aria-disabled="isDisabled" :class="buttonClass" :href="to.toString()"
			:tabindex="isDisabled ? -1 : undefined" role="button" @click="preventDisabledNavigation">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass" />
			</span>
			<slot v-else />
		</a>
		<router-link v-else :aria-disabled="isDisabled" :class="buttonClass" :tabindex="isDisabled ? -1 : undefined"
			:to="to" role="button" @click="preventDisabledNavigation">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass" />
			</span>
			<slot v-else />
		</router-link>
	</template>
	<template v-else>
		<button :class="buttonClass" :disabled="isDisabled" type="button">
			<span v-if="loading" class="Button-loader">
				<spinner-icon :class="loaderClass" />
			</span>
			<slot v-else />
		</button>
	</template>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.Button {
	@apply relative;
	@apply flex items-center justify-center;
	@apply py-1.5 px-4;
	@apply min-w-max;
	@apply text-white;
	@apply rounded-lg;
	@apply border border-transparent;
	@apply cursor-pointer;
	@apply select-none;
	@apply outline-none;
	@apply transition-colors;

}

.Button:not(.Button--disabled):active {
	@apply [&:not(.Button--disabled)]:active:shadow-[inset_0_0.15rem_2px_hsla(0,0%,0%,0.15)];
}

.Button-loader {
	@apply absolute;
	@apply inset-0;
	@apply flex items-center justify-center;
	@apply size-full;
	@apply rounded-lg;
	@apply z-5;
}

.Button--disabled {
	@apply opacity-50;
	@apply cursor-not-allowed;
}

.Button--brand,
.Button--brand .Button-loader {
	@apply bg-brand-700;
	@apply border-brand-700;

	@apply [&:not(.Button--disabled)]:hover:bg-brand-600;
	@apply [&:not(.Button--disabled)]:hover:border-brand-600;
}

.Button--success,
.Button--success .Button-loader {
	@apply bg-green-600;
	@apply border-green-600;

	@apply [&:not(.Button--disabled)]:hover:bg-green-500;
	@apply [&:not(.Button--disabled)]:hover:border-green-500;
}

.Button--warning,
.Button--warning .Button-loader {
	@apply bg-yellow-600;
	@apply border-yellow-600;

	@apply [&:not(.Button--disabled)]:hover:bg-yellow-500;
	@apply [&:not(.Button--disabled)]:hover:border-yellow-500;
}

.Button--danger,
.Button--danger .Button-loader,
.Button--error,
.Button--error .Button-loader {
	@apply bg-red-600;
	@apply border-red-600;

	@apply [&:not(.Button--disabled)]:hover:bg-red-500;
	@apply [&:not(.Button--disabled)]:hover:border-red-500;
}

.Button--xsmall {
	@apply min-h-6;
	@apply px-2 py-0.5;
	@apply text-[12px];
	@apply rounded-sm;
}

.Button--small {
	@apply min-h-7.5;
	@apply px-2 py-1;
	@apply text-[13px];
	@apply rounded-md;
}

.Button--large {
	@apply px-5 py-2.5;
	@apply text-xl;
}
</style>
