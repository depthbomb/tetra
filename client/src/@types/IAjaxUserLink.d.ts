export interface IAjaxUserLink {
	shortcode: string;
	shortlink: string;
	destination: string;
	expiresAt?: Date;
	deletionKey: string;
	createdAt: Date;
}
