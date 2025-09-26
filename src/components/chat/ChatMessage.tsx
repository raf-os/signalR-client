import { cn } from "@/lib/utils";

export type ChatMessageProps = {
	type: "user" | "system",
	body: string,
	sender: string,
    metadata?: {
		type?: "success" | "error" | "neutral" | string
	},
};

export default function ChatMessage(props: ChatMessageProps) {
	const MsgContent = (props.type === "system")
		? SystemChatMessage
		: (props.type === "user")
			? UserChatMessage :
			(null);
	
	return (
		<div className="flex flex-col">
			{ MsgContent && <MsgContent {...props} /> }
		</div>
	)
}

function UserChatMessage({body, sender}: ChatMessageProps) {
	return (
		<>
			<div
				className="text-sm font-neutral-600 font-bold leading-4"
			>
				{ sender }
			</div>
			<div>
				{ body }
			</div>
		</>
	)
}

function SystemChatMessage({body , metadata}: ChatMessageProps) {
	console.log(metadata)
	return (
		<>
			<div
				className={cn(
					"text-sm font-bold leading-4",
					metadata?.type === "success"
						? "text-green-400"
						: metadata?.type === "error"
							? "text-red-400"
							: "text-neutral-800"
				)}
			>
				SYSTEM
			</div>
			<div>
				{ body }
			</div>
		</>
	)
}