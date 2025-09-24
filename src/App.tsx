import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import SignalRHandler from "@/handlers/signalRHandler";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function App() {
	const [ isLoggedIn, setIsLoggedIn ] = useState<boolean>(false);
	const signalHandler = useRef<SignalRHandler | null>(null);
	const [ userName, setUsername ] = useState<string | undefined>(undefined);

	const executeLogin = (username: string) => {
		signalHandler.current = new SignalRHandler();
		setUsername(username);
		setIsLoggedIn(true);
	}

	return (
		<>
			<div
				className="relative flex flex-col gap-4 w-full min-h-lvh md:w-3/4 mx-auto py-8"
			>
				<h1
					className="text-xl font-bold text-center grow-0 shrink-0"
				>
					Vite test live chat app
				</h1>

				<div className="text-sm">
					{ isLoggedIn ? (
						<div>
							Logged in as: <span className="font-bold">{userName}</span>
						</div>
					): (
						<p>Not logged in.</p>
					)}
				</div>

				<ChatBox />

				<ChatInput />

				{ !isLoggedIn && createPortal(
					(<LoginBox loginFn={executeLogin} />),
					document.body
				) }
			</div>
		</>
	)
}

function LoginBox({ loginFn }: { loginFn: (username: string) => void }) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleLogin = () => {
		if (inputRef.current === null) return;
		loginFn(inputRef.current.value);
	}

	return (
		<div
			className="flex items-center justify-center absolute z-10 top-0 left-0 w-full h-full bg-black/25"
		>
			<div
				className="flex flex-col gap-4 rounded-lg shadow-lg bg-neutral-50 border border-neutral-300 w-[600px] p-4"
			>
				<p>You must login, dude</p>
				
				<div className="flex flex-col gap-1">
					<Label>Username</Label>
					<Input ref={inputRef} />
				</div>

				<Button
					type="button"
					onClick={handleLogin}
				>
					Log In
				</Button>
			</div>
		</div>
	)
}

function ChatBox({
	signalHandler
}: {
	signalHandler?: SignalRHandler
}) {
	const [ chatMessages, setChatMessages ] = useState<ChatMessageProps[]>([]);

	useEffect(() => {
		if (signalHandler===undefined) return;

		const handleMessageReceive = ({ username, message }: { username: string, message: string }) => {
			setChatMessages(prevMessages => [...prevMessages, { sender: username, body: message }]);
		}

		signalHandler.observable.on('onMessageReceived', handleMessageReceive);

		return signalHandler.observable.off('onMessageReceived', handleMessageReceive);
	}, [signalHandler]);

	return (
		<div
			className="flex flex-col border px-3 py-2 rounded-lg grow-1 shrink-1 h-full overflow-y-scroll overflow-x-hidden"
		>
			{ chatMessages.length === 0 ? (
				<div>
					No chat messages to show.
				</div>
			): (
				<>
					{chatMessages.map((message, idx) => <ChatMessage body={message.body} sender={message.sender} key={`message-${idx}`} />)}
				</>
			) }
		</div>
	)
}

type ChatMessageProps = {
	body: string,
	sender: string,
	type?: string
}

function ChatMessage({
	body,
	sender,
	type="user"
}: ChatMessageProps) {
	return (
		<div className="flex flex-col">
			<div className="text-sm font-semibold leading-4">
				{ sender }
			</div>
			<div>
				{ body }
			</div>
		</div>
	)
}

function ChatInput() {
	return (
		<div
			className="flex w-full gap-4"
		>
			<Input className="grow-1 shrink-1" />
			<Button className="grow-0 shrink-0">
				submit
			</Button>
		</div>
	)
}