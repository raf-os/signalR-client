import * as signalR from "@microsoft/signalr";
import EventBus from "@/classes/EventBus";

type SignalRHandlerEvents = {
    "onMessageReceived": { username: string, message: string }
}

export default class SignalRHandler {
    connection: signalR.HubConnection;
    observable: EventBus<SignalRHandlerEvents>;
    
    constructor() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("http://localhost:5062/hub").build();
        this.observable = new EventBus<SignalRHandlerEvents>;

        this.connection.on("messageReceived", (username: string, message: string) => {
            this.observable.emit('onMessageReceived', { username, message });
        });

        this.connection.start().catch((err) => console.log(err));
    }

    sendMessage(content: string) {
        if (content.trim().length === 0) return;
        this.connection.send("newMessage", "user", content)
            .then(() => {
                this.observable.emit('onMessageReceived', { username: "user", message: content });
            });
    }
}