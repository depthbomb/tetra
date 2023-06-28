export function useConfig() {
	const attribute = document.querySelector('meta[name="config"]') as HTMLMetaElement;
	const data      = JSON.parse(attribute.content);

	const route: string     = data.route;
	const remoteIp: string  = data.remoteIp;
	const requestId: string = data.requestId;
	const authToken: string = data.authToken;
	const ajaxToken: string = data.ajaxToken;

	return {
		route,
		remoteIp,
		requestId,
		authToken,
		ajaxToken,
	};
}
