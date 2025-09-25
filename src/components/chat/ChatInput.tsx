import { useRef, useContext } from "react";
import AppContext from "@/lib/AppContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatInput() {
	const inputRef = useRef<HTMLInputElement>(null);
	const { sendMessage, isActionPending, username } = useContext(AppContext);

	const isLoggedIn = username !== undefined;

	const handleSubmit = () => {
		if (!inputRef.current) return;

		const val = inputRef.current.value;
		if (val.trim().length === 0) return;

        inputRef.current.value = "";
		sendMessage(val);
	}

	const handleKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleSubmit();
        }
    }

	return (
		<div
			className="flex w-full gap-4"
		>
			<Input
				className="grow-1 shrink-1"
				ref={inputRef}
                onKeyUp={handleKeyUp}
				disabled={username===undefined}
				placeholder={!isLoggedIn? "Please log in to chat" : undefined}
			/>

			<Button
				className="grow-0 shrink-0"
				onClick={handleSubmit}
				disabled={isActionPending || !isLoggedIn}
			>
				SUBMIT
			</Button>
		</div>
	)
}