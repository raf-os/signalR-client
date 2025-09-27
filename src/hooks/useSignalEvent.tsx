import AppContext from "@/lib/AppContext";
import { useContext, useEffect } from "react";
import type { SignalRHandlerEvents } from "@/handlers/signalRHandler";

export default function useSignalEvent<T extends keyof SignalRHandlerEvents>(eventName: T | T[], callback: (payload: SignalRHandlerEvents[T]) => void) {
    const { signalHandler } = useContext(AppContext);

    const _cb = callback;

    useEffect(() => {
        if (!signalHandler) return;

        signalHandler.observable.on(eventName, _cb);
        return () => signalHandler.observable.off(eventName, _cb);
    }, [signalHandler, callback]);

    return;
}