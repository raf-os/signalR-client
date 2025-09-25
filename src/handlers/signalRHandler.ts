import * as signalR from "@microsoft/signalr";
import EventBus from "@/classes/EventBus";
import type { ChatMessageProps } from "@/components/chat/ChatMessage";


type SignalRHandlerEvents = {
    "onMessageReceived": ChatMessageProps,
    "onSuccessfulLogin": { username: string }
}

export default class SignalRHandler {
    connection?: signalR.HubConnection;
    observable: EventBus<SignalRHandlerEvents>;
    
    constructor() {
        this.observable = new EventBus<SignalRHandlerEvents>();
    }

    async attemptConnection() {
        if (this.connection?.state === signalR.HubConnectionState.Connected || this.connection?.state === signalR.HubConnectionState.Connecting) return;
        const urlEndpoint = "http://localhost:5062/hub";
        this.connection = new signalR.HubConnectionBuilder().withUrl(urlEndpoint).build();
        this.setupCallbacks();
        this.connection.start().then(() => this.reportSystemMessage('Connected to server.'), () => this.reportSystemMessage("Error connecting to server."));
    }

    private setupCallbacks() {
        this.connection?.on("ReceiveMessage", (username: string, message: string, type: "user" | "system") => {
            this.observable.emit('onMessageReceived', { sender: username, body: message, type: type });
        });

        this.connection?.on("Register", (username: string) => {
            this.observable.emit('onSuccessfulLogin', { username: username });
        });
    }

    async attemptLogin(username: string) {
        if (!this.connection) return;

        this.connection.invoke("Register", username).catch(() => this.reportSystemMessage('Unknown error logging in.'));
    }

    reportSystemMessage(message: any) {
        this.observable.emit('onMessageReceived', { sender: "sys", body: message, type: "system"});
    }

    async sendMessage(user:string, body: string): Promise<boolean> {
        if (!this.connection) { console.log("No connection"); return false; }
        if (body.trim().length === 0) { return false; }
        await this.connection.send("NewMessage", "user", body);
        this.observable.emit('onMessageReceived', { sender: user, body: body, type: "user" });
        return true;
    }

    disconnect() {
        this.connection?.stop();
    }
}