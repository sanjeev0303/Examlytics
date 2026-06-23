export class SSEManager {
    private eventSource: EventSource | null = null;
    private listeners: Map<string, ((data: any) => void)[]> = new Map();

    connect(url: string) {
        this.disconnect();
        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit(data.event || 'message', data);
            } catch (error) {
                console.error("Error parsing SSE data", error);
            }
        };

        this.eventSource.onerror = (error) => {
            console.error("SSE Error", error);
            this.emit('error', error);
            this.disconnect();
        };
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            this.listeners.set(event, callbacks.filter(cb => cb !== callback));
        }
    }

    private emit(event: string, data: any) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        // Don't clear listeners so they can reconnect if needed
    }
}

export const sseManager = new SSEManager();
