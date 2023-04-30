export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface IToast {
	id:         string;
	type:       ToastType;
	message:    string;
	closeable?: boolean;
}
