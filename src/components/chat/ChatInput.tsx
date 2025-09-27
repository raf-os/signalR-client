import { useRef, useContext, useCallback } from "react";
import AppContext from "@/lib/AppContext";
import useLoginStatus from "@/hooks/useLoginStatus";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatInput() {
	const inputRef = useRef<HTMLInputElement>(null);
	const { sendMessage, isActionPending } = useContext(AppContext);

	const isLoggedIn = useLoginStatus();

	const handleSubmit = useCallback(() => {
		if (!inputRef.current) return;

		const val = inputRef.current.value;
		if (val.trim().length === 0) return;

        inputRef.current.value = "";
		sendMessage(val);
	}, [inputRef, sendMessage, isActionPending]);

	const handleKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleSubmit();
        }
    }

	return (
		<div
			className="flex grow-0 shrink-0 w-full gap-2 rounded-lg shadow-md p-2 bg-neutral-300"
		>
			<Input
				className="grow-1 shrink-1 border-neutral-200 bg-neutral-50"
				ref={inputRef}
                onKeyUp={handleKeyUp}
				disabled={!isLoggedIn}
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