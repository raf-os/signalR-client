import * as signalR from "@microsoft/signalr";
import EventBus from "@/classes/EventBus";
import type { ChatMessageProps } from "@/components/chat/ChatMessage";
import AuthHandler from "@/handlers/authHandler";
import type { StandardJsonResponse } from "@/lib/models/StandardJsonResponse";

const urlEndpoint = "http://localhost:5062/hub";

type TUserInfo = {
    id: string,
    name: string,
}

export type SignalRHandlerEvents = {
    "onMessageReceived": ChatMessageProps,
    "onSuccessfulLogin": { username: string, token: string, connectionId: string },
    "onConnectionStart": {},
    "onConnectionClose": {},
    "onUserListUpdate": TUserInfo[]
}

export default class SignalRHandler {
    connection?: signalR.HubConnection;
    observable: EventBus<SignalRHandlerEvents>;
    authHandler = new AuthHandler();
    
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
                    setTimeout(() => this.tokenSync());
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

        this.connection?.on("UpdateClientList", (props: TUserInfo[]) => {
            this.observable.emit('onUserListUpdate', props);
        });

        this.connection?.onclose(() => {
            this.reportSystemMessage("Connection closed.");
            this.observable.emit('onConnectionClose', {});
        });
    }

    async attemptRegister(username: string, password: string) {
        if (!this.connection) return false;

        const result = await this.connection.invoke<StandardJsonResponse>("Register", { Username: username, Password: password });

        if (!result) {
            this.reportSystemMessage("Unknown error occurred.", "error");
            return false;
        }

        if (result.success) {
            this.reportSystemMessage("Registered successfully. You may now log in.", "success");
            return true;
        } else {
            this.reportSystemMessage(result.message || "Unknown error occurred.", "error");
            return false;
        }
    }

    async attemptLogin(username: string, password: string) {
        if (!this.connection) return;

        const result = await this.connection.invoke<StandardJsonResponse>("LogIn", username, password);

        if (!result) {
            this.reportSystemMessage("Unknown error logging in.", "error");
        }

        if (result.success) {
            this.authHandler.updateLoginToken(result.metadata.Token);
            this.observable.emit('onSuccessfulLogin', { username: result.metadata.Username, token: result.metadata.Token, connectionId: result.metadata.ConnectionId });
            return;
        } else {
            this.reportSystemMessage(result.message || "Unknown login error.", "error");
            return;
        }
    }

    async tokenSync() {
        if (!this.connection) return false;

        const token = this.authHandler.fetchLoginToken();

        if (!token) return false;

        const result = await this.connection.invoke<StandardJsonResponse>("ReLogIn", token);

        if (result.success) {
            this.observable.emit('onSuccessfulLogin', { username: result.metadata.Username, token: result.metadata.Token, connectionId: result.metadata.ConnectionId });
            return true;
        } else {
            return false;
        }
    }

    async attemptLogout() {
        if (!this.connection) return;
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