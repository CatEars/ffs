export class Channel<TMessage> {
    private readonly queue: TMessage[] = [];
    private readonly waiters: ((value: TMessage | null) => void)[] = [];

    pushFirst(item: TMessage) {
        if (this.waiters.length > 0) {
            const resolver = this.waiters.shift();
            if (resolver) {
                resolver(item);
                return;
            }
        }
        this.queue.splice(0, 0, item);
    }

    push(item: TMessage) {
        this.queue.push(item);

        if (this.waiters.length > 0) {
            const resolver = this.waiters.shift();
            if (resolver) {
                // Use `null` as behaviour here to ensure that reader is forced to retry
                // Getting the logic to work correctly for the channel with a manual promise
                // has too many edge cases.
                resolver(null);
                return;
            }
        }
    }

    get size(): number {
        return this.queue.length;
    }

    consume(): Promise<TMessage | null> {
        if (this.queue.length > 0) {
            const first = this.queue.splice(0, 1)[0];
            return Promise.resolve(first);
        } else {
            const waiters = this.waiters;
            return new Promise<TMessage | null>((resolve) => {
                waiters.push(resolve);
            });
        }
    }
}
