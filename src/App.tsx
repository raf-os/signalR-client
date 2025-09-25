import { useState, useRef, useTransition, useContext, useEffect, useCallback } from "react";
import SignalRHandler from "@/handlers/signalRHandler";
import AppContext, { type TAppContext } from "@/lib/AppContext";

import { ChatBox, ChatInput } from "@/components/chat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function App() {
	const [ userName, setUsername ] = useState<string | undefined>(undefined);
	const [ isLoginPending, setIsLoginPending ] = useState<boolean>(false);
	const [ isPending, startTransition ] = useTransition();
	const [ showLoginDialog, setShowLoginDialog ] = useState<boolean>(false);
	const signalHandler = useRef<SignalRHandler | undefined>(undefined);

	const executeLogin = useCallback((username: string) => {
		if (!signalHandler.current) return false;
		if (isLoginPending) return false;
		signalHandler.current.attemptLogin(username);
		setIsLoginPending(true);
		return true;
	}, [signalHandler, userName]);

	const onSuccessfulLogin = ({username}: {username: string}) => {
		setIsLoginPending(false);
		setShowLoginDialog(false);
		setUsername(username);
	}

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
		const sigH = new SignalRHandler();
		sigH.observable.on("onSuccessfulLogin", onSuccessfulLogin);
		signalHandler.current = sigH;
		setTimeout(() => sigH.attemptConnection(), 50);
		
		return () => {
			sigH.observable.off("onSuccessfulLogin", onSuccessfulLogin);
			sigH.disconnect();
			signalHandler.current = undefined;
		}
	}, []);

	const ctx: TAppContext = {
		attemptLogin: executeLogin,
		sendMessage: sendMessage,
		signalHandler: signalHandler.current,
		isActionPending: isPending,
		username: userName
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

				<div className="flex items-center gap-2 text-sm">
					{ (userName) ? (
						<p>
							Logged in as: <span className="font-bold">{userName}</span>
						</p>
					): (
						<>
							<p>Not logged in.</p>
							<Button size="sm" onClick={() => setShowLoginDialog(true)} disabled={isLoginPending}>
								Try to log in bruv
							</Button>
						</>
					)}
				</div>

				<ChatBox />

				<ChatInput />

				<LoginBox isOpen={showLoginDialog} setIsOpen={setShowLoginDialog} isLoginPending={isLoginPending} />
			</div>
		</AppContext.Provider>
	)
}

function LoginBox({ isOpen, setIsOpen, isLoginPending }: { isOpen: boolean, setIsOpen: (o: boolean) => void, isLoginPending: boolean }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { attemptLogin } = useContext(AppContext);

	const handleLogin = () => {
		if (inputRef.current === null) return;
		attemptLogin(inputRef.current.value);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Log In</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-1">
					<Label>Username</Label>
					<Input ref={inputRef} disabled={isLoginPending} />
				</div>

				<DialogFooter>
					<Button
						type="button"
						onClick={handleLogin}
						disabled={isLoginPending}
					>
						Log In
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
