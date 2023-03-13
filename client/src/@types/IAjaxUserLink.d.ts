export interface IAjaxUserLink {
	creatorId: string;
	shortcode: string;
	shortlink: string;
	destination: string;
	expiresAt?: Date;
	deletionKey: string;
	createdAt: Date;
	user: {
		username: string;
		anonymous: boolean;
	};
}
