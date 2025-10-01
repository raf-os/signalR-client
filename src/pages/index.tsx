import { useState, useRef, useTransition, useContext, useEffect, useCallback, startTransition } from "react";
import SignalRHandler from "@/handlers/signalRHandler";
import AppContext, { type TAppContext } from "@/lib/AppContext";

import { ChatBox, ChatInput, ChatUserList } from "@/components/chat";
import { AuthUserData, type AuthMetadata } from "@/lib/models/AuthMetadata";

import AuthBar from "@/components/chat/AuthBar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ChatApp() {
	const [ userData, setUserData ] = useState<AuthUserData | undefined>(undefined);
	const [ isLoginPending, setIsLoginPending ] = useState<boolean>(false);
	const [ isActionPending, startActionTransition ] = useTransition();
	const [ isSignupPending, startSignupTransition ] = useTransition();
	const [ showLoginDialog, setShowLoginDialog ] = useState<boolean>(false);
	const [ showSignupDialog, setShowSignupDialog ] = useState<boolean>(false);
	const [ signalHandler, setSignalHandler ] = useState<SignalRHandler | undefined>(undefined);
	const [ isConnected, setIsConnected ] = useState<boolean>(false);

	const executeLogin = useCallback((username: string, password: string) => {
		if (!signalHandler) return false;
		if (isLoginPending) return false;
		signalHandler.attemptLogin(username, password);
		setIsLoginPending(true);
		return true;
	}, [signalHandler, userData]);

	const onSuccessfulLogin = useCallback((props: AuthMetadata) => {
		setIsLoginPending(false);
		setShowLoginDialog(false);
		const userData = new AuthUserData(props.username, props.token, props.connectionId, props.auth);
		setUserData(userData);
	}, [userData]);

	const attemptSignUp = async (username: string, password: string) => {
		if (!signalHandler) return false;

		setShowSignupDialog(false);

		startSignupTransition(async() => {
			await signalHandler.attemptRegister(username, password);
		});

		return true;
	}

	const executeLogout = () => {
		if (!signalHandler) return;

		signalHandler.attemptLogout();
		setUserData(undefined);
	}

	const sendMessage = useCallback((message: string, callback?: (success: boolean) => void) => {
		if (!signalHandler) { return; }
		if (!userData) { return; }

		startActionTransition(async () => {
			const success = await signalHandler.sendMessage(message);
			if (callback) {
				startTransition(() => callback(success));
			}
		});
	}, [userData, signalHandler]);

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
		attemptSignup: attemptSignUp,
		attemptLogout: executeLogout,
		sendMessage: sendMessage,
		signalHandler: signalHandler,
		isActionPending: isActionPending,
		isConnected: isConnected,
		userData: userData
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

				<AuthBar
					onLoginClick={() => setShowLoginDialog(true)}
					onSignupClick={() => setShowSignupDialog(true)}
					isLoginPending={isLoginPending}
					isSignupPending={isSignupPending}
				/>

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

				<SignupBox
					isOpen={showSignupDialog}
					setIsOpen={setShowSignupDialog}
					isSignupPending={isSignupPending}
				/>
			</div>
		</AppContext.Provider>
	)
}

function LoginBox({ isOpen, setIsOpen, isLoginPending }: { isOpen: boolean, setIsOpen: (o: boolean) => void, isLoginPending: boolean }) {
	const unameRef = useRef<HTMLInputElement>(null);
	const pwRef = useRef<HTMLInputElement>(null);
	const { attemptLogin } = useContext(AppContext);

	const handleLogin = () => {
		if (unameRef.current === null) return;
		if (pwRef.current === null) return;

		attemptLogin(unameRef.current.value, pwRef.current.value);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Log In</DialogTitle>
				</DialogHeader>

				<FormInputField header="Username" disabled={isLoginPending} ref={unameRef} onEnterKey={handleLogin} />
				<FormInputField header="Password" type="password" disabled={isLoginPending} ref={pwRef} onEnterKey={handleLogin} />

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

function SignupBox({isOpen, setIsOpen, isSignupPending}:
	{ isOpen: boolean, setIsOpen: (o: boolean) => void, isSignupPending: boolean}
) {
	const unameRef = useRef<HTMLInputElement>(null);
	const pwRef = useRef<HTMLInputElement>(null);

	const { attemptSignup } = useContext(AppContext);

	const handleSignup = () => {
		if (unameRef.current === null) return;
		if (pwRef.current === null) return;

		const _uname = unameRef.current.value;
		const _pw = pwRef.current.value;

		attemptSignup(_uname, _pw);
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Sign Up</DialogTitle>
				</DialogHeader>

				<FormInputField header="Username" disabled={isSignupPending} ref={unameRef} onEnterKey={handleSignup} />
				<FormInputField header="Password" type="password" disabled={isSignupPending} ref={pwRef} onEnterKey={handleSignup} />

				<DialogFooter>
					<Button
						onClick={handleSignup}
						type="button"
						disabled={isSignupPending}
					>
						Sign Up
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

type FormInputFieldProps = React.ComponentPropsWithRef<'input'> & {
	header: string,
	onEnterKey?: () => void,
}

function FormInputField({
	header,
	className: _,
	onEnterKey,
	...rest
}: FormInputFieldProps){
	const handleKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
		ev.preventDefault();
		if (ev.key === "Enter") { onEnterKey?.(); }
		
	}
	return (
		<div className="flex flex-col gap-1">
			<Label>{ header }</Label>
			<Input {...rest} onKeyUp={handleKeyUp} />
		</div>
	)
}
