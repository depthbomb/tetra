export interface ICreateShortlinkResponse {
	shortcode:    string;
	shortlink:    string;
	destination:  string;
	deletion_key: string;
	expires_at:   string;
}
