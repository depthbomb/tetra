export function isValidHttpUrl(url: string): boolean {
	let inputUrl;
	try {
		inputUrl = new URL(url);
	} catch {
		return false;
	}

	return inputUrl.protocol === "http:" || inputUrl.protocol === "https:";
}
