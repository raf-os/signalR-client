import GlobalConfig from "@/lib/GlobalConfig";
import AuthHandler from "@/handlers/authHandler";

const apiEndpoint = GlobalConfig.serverAddr + "api/";

export type ServerActionResponse<T> = {
    success: boolean,
    message?: string,
    content?: T
}

export async function requestServerAction<T = Record<string, string>>(
    endpoint: string,
    payload: Record<string, any> | null = null
): Promise<ServerActionResponse<T>>{
    const _serverEndpoint = apiEndpoint + endpoint;
    const authHandler = new AuthHandler();
    const loginToken = authHandler.fetchLoginToken();

    if (!loginToken) return { success: false }

    try {
        const response = await fetch(
            _serverEndpoint,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Auth-Token': loginToken
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            return {
                success: false,
                message: `Error sending payload to server: ${response.status}.`
            }
        }

        const responseBody = await response.json();

        return {
            success: true,
            content: responseBody,
        }
    } catch(e) {
        console.log("Error fetching data from API endpoint.",e);
        return {
            success: false,
            message: `Error contacting API server.`
        }
    }
}