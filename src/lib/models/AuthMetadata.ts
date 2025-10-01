export const AuthState = {
    Guest: 0,
    User: 1,
    Operator: 2,
    Admin: 3,
}

export type AuthMetadata = {
    username: string,
    token: string,
    connectionId: string,
    auth: number,
}

export class AuthUserData {
    username: string;
    token: string;
    connectionId: string;
    auth: number;

    constructor (_username: string, _token: string, _connectionId: string, _auth: number){
        this.username = _username;
        this.token = _token;
        this.connectionId = _connectionId;
        this.auth = _auth;
    }
}
