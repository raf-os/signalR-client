type EventHandler<T = any> = (payload: T) => void;

export default class EventBus<Events extends Record<string, any>> {
    private listeners: {
        [K in keyof Events]?: Set<EventHandler<Events[K]>>
    } = {};
    public eventCache: {
        [K in keyof Events]?: Events[K]
    } = {};

    on<K extends keyof Events>(eventName: K | K[], callback: EventHandler<Events[K]>): void {
        const eventNames = Array.isArray(eventName) ? eventName : [eventName];
        for (const event of eventNames) {
            if (!this.listeners[event]) {
                this.listeners[event] = new Set();
            }
            this.listeners[event]!.add(callback);
        }
    }

    off<K extends keyof Events>(eventName: K | K[], callback: EventHandler<Events[K]>): void {
        const eventNames = Array.isArray(eventName) ? eventName : [eventName];
        for (const event of eventNames) {
            this.listeners[event]?.delete(callback);
        }
    }

    emit<K extends keyof Events>(eventName: K, payload: Events[K]): void {
        this.listeners[eventName]?.forEach(handler => handler(payload));
        this.eventCache[eventName] = payload;
    }

    getCachedEvent<K extends keyof Events>(eventName: K, clear: boolean = false) {
        const cache = this.eventCache[eventName];
        if (clear) delete this.eventCache[eventName];
        return cache;
    }
}