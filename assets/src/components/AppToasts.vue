<script setup lang="ts">
	import { useToastStore } from '~/stores/toast';
	import type { IToast } from '~/@types/IToast';

	const toastStore = useToastStore();

	const removeToast = (toast: IToast) => {
		if (toast.closeable) {
			toastStore.removeToast(toast);
		}
	};
</script>

<template>
	<transition-group name="toasts-list" tag="aside" class="Toasts">
		<div :key="toast.id" v-for="toast of toastStore.toasts" :class="['Toast', 'is-' + toast.type]" @click="removeToast(toast)" role="alert">
			<p>{{ toast.message }}</p>
		</div>
	</transition-group>
</template>

<style scoped lang="scss">
	.Toasts {
		@apply absolute;
		@apply top-0 right-0;
		@apply flex flex-col items-end;
		@apply mt-3;
		@apply space-y-3;
		@apply max-h-screen;
		@apply overflow-hidden;

		.Toast {
			@apply flex items-center;
			@apply mr-3;
			@apply py-3 px-6;
			@apply max-w-[256px];
			@apply bg-gray-900;
			@apply border-l-2;
			@apply rounded-2xl;
			@apply shadow-lg;
			@apply cursor-pointer;
			@apply z-20;

			&.is-success {
				@apply text-green-500;
				@apply border-green-500;
			}

			&.is-error {
				@apply text-red-500;
				@apply border-red-500;
			}

			&.is-warning {
				@apply text-amber-500;
				@apply border-amber-500;
			}

			&.is-info {
				@apply text-brand-500;
				@apply bg-brand-500;
			}
		}
	}

	.toasts-list-move,
	.toasts-list-enter-active,
	.toasts-list-leave-active {
		@apply transition-all;
	}

	.toasts-list-enter-from,
	.toasts-list-leave-to {
		@apply opacity-0;
	}

</style>
