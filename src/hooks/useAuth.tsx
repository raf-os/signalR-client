import { useState } from "react";
import useSignalEvent from "./useSignalEvent";
import { AuthState } from "@/lib/models/AuthMetadata";

export default function useAuth(authLevel: number = AuthState.User) {
    const [ isAuthorized, setIsAuthorized ] = useState<boolean>(false);

    useSignalEvent(
        'onSuccessfulLogin',
        ({ auth }) => {
            if (auth >= authLevel) { setIsAuthorized(true); }
            else { setIsAuthorized(false); }
        }
    );
    useSignalEvent(
        'onLogout',
        () => {
            setIsAuthorized(false);
        }
    );
    useSignalEvent(
        'onConnectionClose',
        () => {
            setIsAuthorized(false);
        }
    );

    return isAuthorized;
}

export { AuthState };