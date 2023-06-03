export function useBridge() {
	const { route, remoteIp, requestId, authToken, ajaxToken } = window.Config;
	return {
		route,
		remoteIp,
		requestId,
		authToken,
		ajaxToken,
	};
}
