<script setup lang="ts">
	import { useToastStore } from '~/stores/toast';
	import { reactive, defineAsyncComponent } from 'vue';
	import type { IToast } from '~/@types/IToast';

	const CheckIcon   = defineAsyncComponent(() => import('~/components/icons/CheckIcon.vue'));
	const CloseIcon   = defineAsyncComponent(() => import('~/components/icons/CloseIcon.vue'));
	const WarningIcon = defineAsyncComponent(() => import('~/components/icons/WarningIcon.vue'));
	const InfoIcon    = defineAsyncComponent(() => import('~/components/icons/InfoIcon.vue'));

	const iconMap = reactive({
		success: CheckIcon,
		error:   CloseIcon,
		warning: WarningIcon,
		info:    InfoIcon
	});

	const toastStore = useToastStore();

	const removeToast = (toast: IToast) => {
		if (toast.closeable) {
			toastStore.removeToast(toast);
		}
	};
</script>

<template>
	<transition-group name="toasts-list" tag="aside" class="Toasts">
		<div :key="toast.id" v-for="toast of toastStore.toasts" :class="['Toast', 'Toast--' + toast.type, { 'Toast--emphasized': toast.emphasized }]" @click="removeToast(toast)" role="alert">
			<component :is="iconMap[toast.type]"/>
			<p>{{ toast.message }}</p>
		</div>
	</transition-group>
</template>

<style scoped lang="scss">
	.Toasts {
		@apply absolute;
		@apply top-12 right-0;
		@apply flex flex-col items-end;
		@apply max-h-screen;
		@apply overflow-hidden;
		@apply z-[512];

		.Toast {
			@apply flex items-center;
			@apply mt-3;
			@apply py-3 px-6;
			@apply max-w-[512px];
			@apply bg-gray-900;
			@apply border-t border-b border-l;
			@apply rounded-l-full;
			@apply cursor-pointer;
			@apply z-[32];

			&--emphasized {
				@apply bg-[length:3rem];

				&.Toast--success {
					background-image: linear-gradient(45deg, theme('colors.green.950') 25%, transparent 25%, transparent 50%, theme('colors.green.950') 50%, theme('colors.green.950') 75%, transparent 75%, transparent 100%);
				}

				&.Toast--error {
					background-image: linear-gradient(45deg, theme('colors.red.950') 25%, transparent 25%, transparent 50%, theme('colors.red.950') 50%, theme('colors.red.950') 75%, transparent 75%, transparent 100%);
				}

				&.Toast--warning {
					background-image: linear-gradient(45deg, theme('colors.yellow.950') 25%, transparent 25%, transparent 50%, theme('colors.yellow.950') 50%, theme('colors.yellow.950') 75%, transparent 75%, transparent 100%);
				}

				&.Toast--info {
					background-image: linear-gradient(45deg, theme('colors.cyan.950') 25%, transparent 25%, transparent 50%, theme('colors.cyan.950') 50%, theme('colors.cyan.950') 75%, transparent 75%, transparent 100%);
				}
			}

			&--success {
				@apply text-green-400;
				@apply border-green-500;
			}

			&--error {
				@apply text-red-400;
				@apply border-red-500;
			}

			&--warning {
				@apply text-yellow-400;
				@apply border-yellow-500;
			}

			&--info {
				@apply text-cyan-400;
				@apply bg-cyan-500;
			}

			svg {
				@apply mr-3 w-4 h-4;
			}
		}
	}

	.toasts-list-move,
	.toasts-list-enter-active,
	.toasts-list-leave-active {
		@apply transition-all duration-[250ms];
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
