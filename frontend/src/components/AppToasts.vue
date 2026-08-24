<script lang="ts" setup>
import type { Component } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useToastStore } from '~/stores/toast';
import type { IToast, ToastType } from '~/@types/IToast';

const CheckIcon = defineAsyncComponent(() => import('~/components/icons/CheckIcon.vue'));
const CloseIcon = defineAsyncComponent(() => import('~/components/icons/CloseIcon.vue'));
const WarningIcon = defineAsyncComponent(() => import('~/components/icons/WarningIcon.vue'));
const InfoIcon = defineAsyncComponent(() => import('~/components/icons/InfoIcon.vue'));

const iconMap = {
	success: CheckIcon,
	error: CloseIcon,
	warning: WarningIcon,
	info: InfoIcon
} satisfies Record<ToastType, Component>;

const toastStore = useToastStore();

const removeToast = (toast: IToast) => {
	if (toast.closeable) {
		toastStore.removeToast(toast);
	}
};
</script>

<template>
	<transition-group class="Toasts" name="toasts-list" tag="aside">
		<div v-for="toast of toastStore.toasts" :key="toast.id" :class="['Toast', 'Toast--' + toast.type]" role="alert"
			@click="removeToast(toast)">
			<component :is="iconMap[toast.type]" />
			<p>{{ toast.message }}</p>
		</div>
	</transition-group>
</template>

<style scoped>
@reference "~/assets/css/app.css";

.Toasts {
	@apply absolute;
	@apply top-12 right-0;
	@apply flex flex-col items-end;
	@apply max-h-screen;
	@apply overflow-hidden;
	@apply z-512;

	.Toast {
		@apply flex items-center;
		@apply mt-3;
		@apply py-3 px-6;
		@apply max-w-lg;
		@apply bg-gray-900/50;
		@apply backdrop-blur;
		@apply border-t border-b border-l;
		@apply rounded-l-lg;
		@apply cursor-pointer;
		@apply z-32;

		svg {
			@apply mr-3 w-4 h-4;
		}
	}

	.Toast--success {
		@apply text-green-400;
		@apply border-green-500;
	}

	.Toast--error {
		@apply text-red-400;
		@apply border-red-500;
	}

	.Toast--warning {
		@apply text-yellow-400;
		@apply border-yellow-500;
	}

	.Toast--info {
		@apply text-cyan-400;
		@apply bg-cyan-500;
	}
}

.toasts-list-move,
.toasts-list-enter-active,
.toasts-list-leave-active {
	@apply transition-all duration-250;
}

.toasts-list-enter-to {
	@apply ease-out-circ;
}

.toasts-list-leave-to {
	@apply ease-in-circ;
}

.toasts-list-enter-from,
.toasts-list-leave-to {
	@apply opacity-0;
	@apply translate-x-full;
}
</style>
