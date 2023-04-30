export function useBridge() {
	const attribute = document.body.getAttribute('data-bridge');
	const parsed    = JSON.parse(decodeURIComponent(attribute!));

	const route     = parsed.route;
	const ip        = parsed.ip;
	const id        = parsed.id;
	const authToken = parsed.authToken;
	const ajaxToken = parsed.ajaxToken;

	return {
		route,
		ip,
		id,
		authToken,
		ajaxToken,
	};
}
