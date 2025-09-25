import SignalRHandler from "./signalRHandler";

export default class CredentialsHandler {
    username?: string;
    signalHandler: SignalRHandler;

    constructor(_signalHandler: SignalRHandler) {
        this.signalHandler = _signalHandler;
    }
}