export function useTruncation() {
	const truncate = (input: string, length: number, ellipsis = true): string => `${input.slice(0, length)}${ellipsis && input.length > length ? '…' : ''}`;

	return { truncate };
}
