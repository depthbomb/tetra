const _PREFIX = 'tetra/' as const;

const _getBridgeElement = (key: string): HTMLMetaElement | null => {
	const name     = _PREFIX + key;
	const selector = `meta[name="${name}"]`;
	return document.querySelector(selector);
}

export const useBridge = (key: string): string => {
	const element = _getBridgeElement(key);
	if (!element) {
		throw new Error(`Unable to find bridge element by key "${key}"`);
	}

	return element.content;
}
