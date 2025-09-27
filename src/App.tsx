import { useState, useRef, useTransition, useContext, useEffect, useCallback } from "react";
import SignalRHandler from "@/handlers/signalRHandler";
import AppContext, { type TAppContext } from "@/lib/AppContext";

import { ChatBox, ChatInput, ChatUserList } from "@/components/chat";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function App() {
	const [ userName, setUsername ] = useState<string | undefined>(undefined);
	const [ isLoginPending, setIsLoginPending ] = useState<boolean>(false);
	const [ isActionPending, startTransition ] = useTransition();
	const [ showLoginDialog, setShowLoginDialog ] = useState<boolean>(false);
	const [ signalHandler, setSignalHandler ] = useState<SignalRHandler | undefined>(undefined);
	const [ isConnected, setIsConnected ] = useState<boolean>(false);

	const executeLogin = useCallback((username: string) => {
		if (!signalHandler) return false;
		if (isLoginPending) return false;
		signalHandler.attemptLogin(username);
		setIsLoginPending(true);
		return true;
	}, [signalHandler, userName]);

	const onSuccessfulLogin = useCallback(({username}: {username: string}) => {
		setIsLoginPending(false);
		setShowLoginDialog(false);
		setUsername(username);
	}, []);

	const sendMessage = useCallback((message: string, callback?: (success: boolean) => void) => {
		if (!signalHandler) { return; }
		if (!userName) { return; }

		startTransition(async () => {
			const success = await signalHandler.sendMessage(userName, message);
			callback?.(success);
		});
	}, [userName, signalHandler]);

	useEffect(() => {
		const onConnectionOpen = () => {
			setIsConnected(true);
		}

		const onConnectionClose = () => {
			setIsConnected(false);
		}

		const sigH = new SignalRHandler();
		sigH.observable.on("onSuccessfulLogin", onSuccessfulLogin);
		sigH.observable.on("onConnectionClose", onConnectionClose);
		setSignalHandler(sigH);
		const _t = setTimeout(async () => {
			const success = await sigH.attemptConnection();
			if (success) {
				onConnectionOpen();
			}
		}, 50);
		
		return () => {
			clearTimeout(_t);
			sigH.observable.off("onSuccessfulLogin", onSuccessfulLogin);
			sigH.observable.off("onConnectionClose", onConnectionClose);
			sigH.disconnect();
			setSignalHandler(undefined);
		}
	}, []);

	const ctx: TAppContext = {
		attemptLogin: executeLogin,
		sendMessage: sendMessage,
		signalHandler: signalHandler,
		isActionPending: isActionPending,
		isConnected: isConnected,
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
					React live chat app
				</h1>

				<LoginStatusComponent onClick={() => setShowLoginDialog(true)} isLoginPending={isLoginPending} />

				<div className="flex w-full h-2 gap-4 grow-1 shrink-1">
					<ChatUserList />
					<ChatBox />
				</div>

				<ChatInput />

				<LoginBox
					isOpen={showLoginDialog}
					setIsOpen={setShowLoginDialog}
					isLoginPending={isLoginPending}
				/>
			</div>
		</AppContext.Provider>
	)
}

function LoginStatusComponent({ onClick, isLoginPending }: { onClick: () => void, isLoginPending: boolean }) {
	const { username, isConnected } = useContext(AppContext);

	const isLoggedIn = username !== undefined;

	return (
		<div className="flex items-center gap-2 text-sm border shadow-sm rounded-lg h-12 px-4">
			{ isConnected
				? (
					isLoggedIn
						? (
							<p>
								Logged in as: <strong>{ username }</strong>
							</p>
						): (
							<>
								<p>You're not logged in.</p>
								<Button
									onClick={onClick}
									size="sm"
									disabled={isLoginPending}
								>
									Log In
								</Button>
							</>
						)
				): (
					<>
						<p>
							No server connection.
						</p>
					</>
				)}
		</div>
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
