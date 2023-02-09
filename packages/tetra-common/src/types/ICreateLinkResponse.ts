export interface ICreateLinkResponse {
	shortcode: string;
	shortlink: string;
	destination: string;
	deletionKey: string;
	expiresAt?: Date;
}
