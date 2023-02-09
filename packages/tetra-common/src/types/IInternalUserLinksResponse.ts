export interface IInternalUserLinks {
	shortcode: string;
	shortlink: string;
	destination: string;
	expiresAt?: Date;
	deletionKey: string;
	createdAt: Date;
}

export interface IInternalUserLinksResponse {
	userLinks: IInternalUserLinks[];
}
