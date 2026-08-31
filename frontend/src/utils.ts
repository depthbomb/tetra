export function isValidHttpUrl(url: string): boolean {
	let inputUrl: URL;
	try {
		inputUrl = new URL(url);
	} catch {
		return false;
	}

	return inputUrl.protocol === 'http:' || inputUrl.protocol === 'https:';
}

const reservedShortcodes = new Set(['api', 'go', 'health', 'oidc', 'ready', 'sse']);
const shortcodePattern   = /^[a-zA-Z0-9_-]{3,64}$/;

export function isValidShortcode(shortcode: string): boolean {
	return shortcodePattern.test(shortcode) && !reservedShortcodes.has(shortcode.toLowerCase());
}
