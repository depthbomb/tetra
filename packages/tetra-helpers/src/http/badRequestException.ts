import { STATUS_CODES }  from 'node:http';
import { HttpException } from './httpException';

export class BadRequestException extends HttpException {
	public constructor(message: string) {
		super(400, message ?? STATUS_CODES[400]);
	}
}
