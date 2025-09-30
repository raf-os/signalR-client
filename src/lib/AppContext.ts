import { createContext } from "react";
import SignalRHandler from "@/handlers/signalRHandler";

export type TAppContext = {
    attemptLogin: (username: string, password: string) => boolean,
    attemptSignup: (username: string, password: string) => Promise<boolean>,
    sendMessage: (message: string, callback?: (success: boolean) => void) => void,
    signalHandler: SignalRHandler | undefined,
    isActionPending: boolean,
    isConnected: boolean,
    username?: string,
}

export const DefaultAppContext: TAppContext = {
    attemptLogin: () => false,
    attemptSignup: async () => false,
    sendMessage: () => {},
    signalHandler: undefined,
    isActionPending: false,
    isConnected: false,
}

const AppContext = createContext<TAppContext>(DefaultAppContext);
export default AppContext;