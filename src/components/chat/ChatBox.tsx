import ChatMessage, { type ChatMessageProps } from "./ChatMessage";
import AppContext from "@/lib/AppContext";
import { useState, useEffect, useContext } from "react";

export default function ChatBox() {
	const [ chatMessages, setChatMessages ] = useState<ChatMessageProps[]>([]);
    const { signalHandler } = useContext(AppContext);

	useEffect(() => {
		if (!signalHandler) return;

		const handleMessageReceive = ({ sender, body, type }: ChatMessageProps) => {
			setChatMessages(prevMessages => [...prevMessages, { type: type, sender: sender, body: body }]);
		}

		signalHandler.observable.on('onMessageReceived', handleMessageReceive);

		return () => {
            signalHandler.observable.off('onMessageReceived', handleMessageReceive);
        }
	}, [signalHandler]);

	return (
		<div
			className="flex flex-col gap-2 border px-3 py-2 rounded-lg grow-1 shrink-1 h-full overflow-y-scroll overflow-x-hidden"
		>
			{ chatMessages.length === 0 ? (
				<div>
					No chat messages to show.
				</div>
			): (
				<>
					{chatMessages.map((message, idx) => <ChatMessage type={message.type} body={message.body} sender={message.sender} key={`message-${idx}`} />)}
				</>
			) }
		</div>
	)
}