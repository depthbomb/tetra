export interface ILoginResponse {
    accessToken: string;
    payload: {
        id: string;
        username: string;
    }
}
