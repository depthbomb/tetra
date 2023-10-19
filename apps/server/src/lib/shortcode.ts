import { uid } from 'uid/single';
import { database } from '@database';

export async function getUnusedShortcode(): Promise<string> {
	const maxAttempts = 10;
	let attempts      = 0;
	let length        = 3;
	let found         = true;
	let shortcode     = '';

	do {
		shortcode = uid(length);
		found     = !!await database.shortlink.findFirst({ where: { shortcode } });

		if (attempts < maxAttempts) {
			attempts++;
		} else {
			length++;
			attempts = 0;
		}

	} while (found);

	return shortcode
}
