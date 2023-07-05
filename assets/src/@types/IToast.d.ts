export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface IToast {
	id:          string;
	type:        ToastType;
	message:     string;
	emphasized?: boolean;
	closeable?:  boolean;
}
