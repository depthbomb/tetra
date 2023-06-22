export function useBridge() {
	const attributeValue = document.body.dataset.config!;
	const data           = JSON.parse(attributeValue);

	const route: string     = data.route;
	const remoteIp: string  = data.remoteIp;
	const requestId: string = data.requestId;
	const authToken: string = data.authToken;
	const ajaxToken: string = data.ajaxToken;
	const authUrl: string   = data.authUrl;

	return {
		route,
		remoteIp,
		requestId,
		authToken,
		ajaxToken,
		authUrl,
	};
}
