export interface IAllShortlinksRecord {
	shortcode:      string;
	secret:         string;
	destination:    string;
	creator_ip:     string;
	disabled:       boolean;
	expires_at?:    string;
	created_at:     string;
	user_id?:       number;
	user_username?: number;
	user_sub?:      number;
}
