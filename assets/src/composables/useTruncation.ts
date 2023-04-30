export function useTruncation() {
	const truncate = (input: string, length: number, ellipsis: boolean = true): string => `${input.substring(0, length)}${(ellipsis && input.length > length) ? '...' : ''}`;

	return { truncate };
}
