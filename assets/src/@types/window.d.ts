interface Window {
	Config: {
		route:     string;
		remoteIp:  string;
		requestId: string;
		authToken: string;
		ajaxToken: string;

		User: {
			username: string;
			avatar:   string;
			roles:    string[];
			apiKey:   string;
		}
	}
}
