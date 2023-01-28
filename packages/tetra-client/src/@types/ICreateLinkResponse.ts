export interface ICreateLinkResponse {
    shortcode: string;
    destination: string;
    deletionKey: string;
    expiresAt?: Date;
}
