import { createContext } from "react";
import type SignalRHandler from "@/handlers/signalRHandler";

export type TAppContext = {
    attemptLogin: (username: string) => boolean,
    sendMessage: (message: string, callback?: () => void) => void,
    signalHandler: SignalRHandler | undefined,
    isActionPending: boolean,
}

export const DefaultAppContext: TAppContext = {
    attemptLogin: () => false,
    sendMessage: () => {},
    signalHandler: undefined,
    isActionPending: false,
}

const AppContext = createContext<TAppContext>(DefaultAppContext);
export default AppContext;