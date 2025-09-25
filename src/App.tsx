import { useState, useRef, useTransition, useContext, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import SignalRHandler from "@/handlers/signalRHandler";
import AppContext, { type TAppContext } from "@/lib/AppContext";

import { ChatBox, ChatInput } from "@/components/chat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function App() {
	const [ isLoggedIn, setIsLoggedIn ] = useState<boolean>(false);
	const [ userName, setUsername ] = useState<string | undefined>(undefined);
	const [ isPending, startTransition ] = useTransition();
	const signalHandler = useRef<SignalRHandler | undefined>(undefined);

	const executeLogin = useCallback((username: string) => {
		if (!signalHandler.current) return false;
		signalHandler.current.attemptConnection();
		setUsername(username);
		setIsLoggedIn(true);
		return true;
	}, [signalHandler, userName]);

	const sendMessage = useCallback((message: string, callback?: () => void) => {
		if (!signalHandler.current) return;
		if (!signalHandler) { console.log("No signal handler"); return; }
		if (!userName) { console.log("No username"); return; }

		startTransition(async () => {
			await signalHandler.current?.sendMessage(userName, message);
			callback?.();
		});
	}, [signalHandler, userName]);

	useEffect(() => {
		signalHandler.current = new SignalRHandler();

		return () => {
			signalHandler.current?.disconnect();
			signalHandler.current = undefined;
		}
	}, []);

	const ctx: TAppContext = {
		attemptLogin: executeLogin,
		sendMessage: sendMessage,
		signalHandler: signalHandler.current,
		isActionPending: isPending
	}

	return (
		<AppContext.Provider value={ctx}>
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
					(<LoginBox />),
					document.body
				) }
			</div>
		</AppContext.Provider>
	)
}

function LoginBox() {
	const inputRef = useRef<HTMLInputElement>(null);
	const { attemptLogin } = useContext(AppContext);

	const handleLogin = () => {
		if (inputRef.current === null) return;
		attemptLogin(inputRef.current.value);
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
