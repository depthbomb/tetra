import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useId } from '~/composables/useId';
import type { IToast, ToastType } from '~/@types/IToast';

export const useToastStore = defineStore('toast', () => {
	const toasts         = ref<Set<IToast>>(new Set<IToast>());
	const { generateId } = useId();

	function removeToast(toast: IToast) {
		if (toasts.value.has(toast)) {
			toasts.value.delete(toast);
		}
	}

	function createToast(type: ToastType, message: string, closeable = true, timeout = 1_500) {
		const id    = generateId();
		const toast = { id, type, message, closeable };
		toasts.value.add(toast);
		setTimeout(() => removeToast(toast), timeout);
	}

	return { toasts, createToast, removeToast };
});
