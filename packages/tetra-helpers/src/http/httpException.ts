import { STATUS_CODES } from 'node:http';

export class HttpException extends Error {
	public code: number;

	public constructor(code: number, message?: string) {
		super(message ?? STATUS_CODES[code] ?? '');
		this.code = code;
	}
}
