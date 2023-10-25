import { Context } from 'koa';
import { Crypto } from '@utils/crypto';
import type { SetOption, GetOption } from 'cookies';

type SetOptions = Omit<SetOption, 'signed'> & { encrypt?: boolean; };
type GetOptions = Omit<GetOption, 'signed'> & { encrypted?: boolean; };

export function setCookie(ctx: Context, name: string, value: string, options?: SetOptions): void {
	if (options?.encrypt === true) {
		value = Crypto.encryptString(value);
	}

	ctx.cookies.set(name, value, {
		...options,
		signed: false // signing doesn't offer much protection
	});
}

export function getCookie(ctx: Context, name: string, options?: GetOptions): string | undefined {
	let value = ctx.cookies.get(name, {
		...options,
		signed: false
	});
	if (value && options?.encrypted === true) {
		value = Crypto.decryptString(value);
	}

	return value;
}

export function deleteCookie(ctx: Context, name: string, options?: Omit<SetOptions, 'encrypt'>): void {
	ctx.cookies.set(name, null, {
		...options,
		signed: false,
		maxAge: 1,
		expires: new Date(1)
	});
}
