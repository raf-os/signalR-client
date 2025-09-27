import * as signalR from "@microsoft/signalr";
import EventBus from "@/classes/EventBus";
import type { ChatMessageProps } from "@/components/chat/ChatMessage";

const urlEndpoint = "http://localhost:5062/hub";

type TUserInfo = {
    id: string,
    name: string,
}

export type SignalRHandlerEvents = {
    "onMessageReceived": ChatMessageProps,
    "onSuccessfulLogin": { username: string },
    "onConnectionStart": {},
    "onConnectionClose": {},
    "onUserListUpdate": TUserInfo[]
}

export default class SignalRHandler {
    connection?: signalR.HubConnection;
    observable: EventBus<SignalRHandlerEvents>;
    
    constructor() {
        this.observable = new EventBus<SignalRHandlerEvents>();
    }

    async attemptConnection() {
        if (
            this.connection?.state === signalR.HubConnectionState.Connected
            || this.connection?.state === signalR.HubConnectionState.Connecting
            || this.connection?.state === signalR.HubConnectionState.Reconnecting
        ) return;
        
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(urlEndpoint)
            //.withAutomaticReconnect()
            .build();
        this.setupCallbacks();

        const success = await this.connection.start()
            .then(
                () => {
                    this.reportSystemMessage('Connected to server.', "success");
                    this.observable.emit('onConnectionStart', {});
                    return true;
                },
                () => { this.reportSystemMessage("Error connecting to server.", "error"); return false; }
            );
        return success;
    }

    private setupCallbacks() {
        this.connection?.on("ReceiveMessage", (username: string, message: string, type: "user" | "system") => {
            this.observable.emit('onMessageReceived', { sender: username, body: message, type: type });
        });

        this.connection?.on("Register", (username: string) => {
            this.observable.emit('onSuccessfulLogin', { username: username });
        });

        this.connection?.on("UpdateClientList", (props: TUserInfo[]) => {
            this.observable.emit('onUserListUpdate', props);
        });

        this.connection?.onclose(() => {
            this.reportSystemMessage("Connection closed.");
            this.observable.emit('onConnectionClose', {});
        });
    }

    async attemptLogin(username: string) {
        if (!this.connection) return;

        this.connection.invoke("Register", username).catch(() => this.reportSystemMessage('Unknown error logging in.'));
    }

    reportSystemMessage(message: any, type?: string) {
        const metadata = (type) ? { type: type } : undefined;
        this.observable.emit('onMessageReceived', { sender: "sys", body: message, type: "system", metadata});
    }

    async sendMessage(user:string, body: string): Promise<boolean> {
        if (!this.connection) { console.log("No connection"); return false; }
        if (body.trim().length === 0) { return false; }
        await this.connection.send("NewMessage", "user", body);
        this.observable.emit('onMessageReceived', { sender: user, body: body, type: "user" });
        return true;
    }

    isConnected(): boolean {
        if (!this.connection) return false;

        if (this.connection.state !== signalR.HubConnectionState.Connected) return false;

        return true;
    }

    disconnect() {
        this.connection?.stop();
    }
}