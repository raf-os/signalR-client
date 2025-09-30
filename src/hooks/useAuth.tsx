import { useState } from "react";
import useSignalEvent from "./useSignalEvent";

export default function useAuth() {
    const [ isAuthorized, setIsAuthorized ] = useState<boolean>(false);

    useSignalEvent(
        'onSuccessfulLogin',
        () => {
            setIsAuthorized(true);
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