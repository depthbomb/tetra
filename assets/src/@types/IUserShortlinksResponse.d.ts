export interface IUserShortlinksResponse {
	shortcode:   string;
	shortlink:   string;
	destination: string;
	secret:      string;
	created_at:  string;
	expires_at?: string;
}
