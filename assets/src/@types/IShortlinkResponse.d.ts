export interface IShortlinksResponse {
	shortlink:   string;
	destination: string;
	created_at:  string;
	expires_at?: string;
}
