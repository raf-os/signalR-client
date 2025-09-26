import ChatMessage, { type ChatMessageProps } from "./ChatMessage";
import AppContext from "@/lib/AppContext";
import { useState, useEffect, useContext } from "react";

import { ScrollArea } from "../ui/scroll-area";

export default function ChatBox() {
	const [ chatMessages, setChatMessages ] = useState<ChatMessageProps[]>([]);
    const { signalHandler } = useContext(AppContext);

	useEffect(() => {
		if (!signalHandler) return;

		const handleMessageReceive = (props: ChatMessageProps) => {
			setChatMessages(prevMessages => [...prevMessages, props]);
		}

		const cachedEvent = signalHandler.observable.getCachedEvent("onMessageReceived", true);
		if (cachedEvent) handleMessageReceive(cachedEvent);

		signalHandler.observable.on('onMessageReceived', handleMessageReceive);

		return () => {
            signalHandler.observable.off('onMessageReceived', handleMessageReceive);
        }
	}, [signalHandler]);

	return (
		<ScrollArea
			className="flex flex-col gap-2 border p-3 rounded-lg grow-1 shrink-1 h-full"
		>
			{ chatMessages.length === 0 ? (
				<div>
					Attempting connection...
				</div>
			): (
				<>
					{chatMessages.map((message, idx) => <ChatMessage key={`message-${idx}`} {...message} />)}
				</>
			) }
		</ScrollArea>
	)
}