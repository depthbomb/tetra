export interface IUserShortlinksResponse {
	shortcode:   string;
	shortlink:   string;
	destination: string;
	secret:      string;
	created_at:  Date;
	expires_at?: Date;
}
