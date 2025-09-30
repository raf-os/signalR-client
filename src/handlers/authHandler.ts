export default class AuthHandler {
    fetchLoginToken() {
        return localStorage.getItem("token");
    }

    updateLoginToken(token: string) {
        localStorage.setItem("token", token);
    }

    removeLoginToken() {
        localStorage.removeItem("token");
    }
}