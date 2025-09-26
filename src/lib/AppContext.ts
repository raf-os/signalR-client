import { createContext } from "react";
import SignalRHandler from "@/handlers/signalRHandler";

export type TAppContext = {
    attemptLogin: (username: string) => boolean,
    sendMessage: (message: string, callback?: (success: boolean) => void) => void,
    signalHandler: SignalRHandler | undefined,
    isActionPending: boolean,
    username?: string,
}

export const DefaultAppContext: TAppContext = {
    attemptLogin: () => false,
    sendMessage: () => {},
    signalHandler: undefined,
    isActionPending: false,
}

const AppContext = createContext<TAppContext>(DefaultAppContext);
export default AppContext;