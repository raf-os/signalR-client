import { cn } from "@/lib/utils";

export type ChatMessageProps = {
	type: "user" | "system",
	body: string,
	sender: string,
    metadata?: string,
};

export default function ChatMessage(props: ChatMessageProps) {
	return (
		<div className="flex flex-col">
			<div className={cn(
                "text-sm font-semibold leading-4",
                props.type === "system"? "text-red-400" : "text-neutral-600"
                )}>
				{ props.type === "user" ? `${props.sender}` : "SYSTEM" }
			</div>
			<div>
				{ props.body }
			</div>
		</div>
	)
}