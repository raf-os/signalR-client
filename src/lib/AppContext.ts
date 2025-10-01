import { createContext } from "react";
import SignalRHandler from "@/handlers/signalRHandler";
import { type AuthUserData } from "./models/AuthMetadata";

export type TAppContext = {
    attemptLogin: (username: string, password: string) => boolean,
    attemptSignup: (username: string, password: string) => Promise<boolean>,
    attemptLogout: () => void,
    sendMessage: (message: string, callback?: (success: boolean) => void) => void,
    signalHandler: SignalRHandler | undefined,
    isActionPending: boolean,
    isConnected: boolean,
    userData?: AuthUserData,
}

export const DefaultAppContext: TAppContext = {
    attemptLogin: () => false,
    attemptSignup: async () => false,
    attemptLogout: () => false,
    sendMessage: () => {},
    signalHandler: undefined,
    isActionPending: false,
    isConnected: false,
}

const AppContext = createContext<TAppContext>(DefaultAppContext);
export default AppContext;