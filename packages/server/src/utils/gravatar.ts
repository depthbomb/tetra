import { createHash } from 'crypto';

const GRAVATAR_BASE_URL = 'https://www.gravatar.com/avatar/';
const GRAVATAR_SECURE_BASE_URL = 'https://secure.gravatar.com/avatar/';

type GravatarDefault =
	| '404'
	| 'mp'
	| 'identicon'
	| 'monsterid'
	| 'wavatar'
	| 'retro'
	| 'robohash'
	| 'blank';
type GravatarRating = 'r' | 'pg' | 'g';

export function createGravatar(
	email: string,
	{
		size = 80,
		placeholder = 'identicon',
		rating = 'pg',
		secure = true,
	}: {
		size?: number;
		placeholder?: GravatarDefault;
		rating?: GravatarRating;
		secure?: boolean;
	} = {}
): string {
	const options = new URLSearchParams({
		s: size.toString(),
		d: placeholder,
		r: rating,
	});

	const hashFunction = secure ? 'sha256' : 'md5';
	const hash = createHash(hashFunction).update(email.toLowerCase()).digest('hex');
	const baseUrl = secure ? GRAVATAR_SECURE_BASE_URL : GRAVATAR_BASE_URL;

	return baseUrl + hash + '?' + options.toString();
}
