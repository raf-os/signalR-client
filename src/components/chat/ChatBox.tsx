import ChatMessage, { type ChatMessageProps } from "./ChatMessage";
import AppContext from "@/lib/AppContext";
import { useState, useEffect, useContext, useRef } from "react";

import * as ScrollArea from "@radix-ui/react-scroll-area";

export default function ChatBox() {
	const [ chatMessages, setChatMessages ] = useState<ChatMessageProps[]>([]);
    const { signalHandler } = useContext(AppContext);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!signalHandler) return;

		const handleMessageReceive = (props: ChatMessageProps) => {
			setChatMessages(prevMessages => [...prevMessages, props]);
		}

		//const cachedEvent = signalHandler.observable.getCachedEvent("onMessageReceived", true);
		//if (cachedEvent) handleMessageReceive(cachedEvent);

		signalHandler.observable.on('onMessageReceived', handleMessageReceive);

		return () => {
            signalHandler.observable.off('onMessageReceived', handleMessageReceive);
        }
	}, [signalHandler]);

	useEffect(() => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
		}
	}, [chatMessages]);

	return (
		<ScrollArea.Root className="grow-1 shrink-1 h-1 overflow-hidden pr-[28px]" type="always" >
			<ScrollArea.Viewport className="size-full p-3 border rounded-lg">
				<div className="flex flex-col gap-2">
				{ chatMessages.length === 0 ? (
					<p>
						Attempting connection...
					</p>
				): (
					<>
						{chatMessages.map((message, idx) => <ChatMessage key={`message-${idx}`} {...message} />)}
					</>
				) }
				</div>
				<ScrollArea.Scrollbar className="flex p-[4px] w-[20px] rounded-full border" forceMount>
					<ScrollArea.Thumb className="bg-primary flex-1 rounded-full" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Viewport>
			
		</ScrollArea.Root>
	)
}