import GlobalConfig from "@/lib/GlobalConfig";
import { AuthState } from "@/hooks/useAuth";
import AuthHandler from "@/handlers/authHandler";

export default async function validateToken(required: number = AuthState.Guest) {
    // Basic auth check
    const endpoint = GlobalConfig.serverAddr + "api/validateToken";
    const token = new AuthHandler().fetchLoginToken();
    const data = { loginToken: token };

    try {
        const response = await fetch(
            endpoint,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            console.log("Error validating login token: ", response.status);
            return { isValid: false };
        }

        const rBody = await response.json();
        const authLevel = Number(rBody.auth);

        return { isValid: authLevel >= required, authState: authLevel };
    } catch(error) {
        console.log("Error sending fetch request to server.", error);
        return { isValid: false };
    }
}