import { EventEmitter } from 'node:events';
import { sleep } from '../sleep/sleep.ts';

export type WorkerRpcRequestOptions = {
    timeoutMs: number;
};

export type IdCarrierOrTypeCarrier = {
    id: string;
} | {
    type: string;
};

export class WorkerRpc<
    TSendMessage extends IdCarrierOrTypeCarrier,
    TReceiveMessage extends IdCarrierOrTypeCarrier,
> {
    private readonly wrappedWorker: Worker;
    private readonly messageEmitter: EventEmitter;

    constructor(wrappedWorker: Worker, messageEmitter: EventEmitter) {
        this.wrappedWorker = wrappedWorker;
        this.messageEmitter = messageEmitter;
    }

    post(message: TSendMessage) {
        this.wrappedWorker.postMessage(message);
    }

    on($type: string, handler: (msg: TReceiveMessage) => void) {
        this.messageEmitter.on($type, handler);
    }

    async request(
        message: TSendMessage,
        options: Partial<WorkerRpcRequestOptions> = {},
    ): Promise<TReceiveMessage | null> {
        const msg = message as unknown as {
            id: undefined;
        };
        if (!msg.id) {
            throw new Error(
                'When requesting via WorkerRpc you must specify an ID to correlate calling and receiving ends',
            );
        }

        // Response setup
        const timeout = options.timeoutMs || 5050;
        let result: TReceiveMessage | null = null;
        let resolver: (() => void) | null = null;
        const finishPromise = new Promise<void>((resolve) => resolver = resolve);
        const handler = (msg: TReceiveMessage) => {
            result = msg;
            if (resolver) {
                resolver();
            }
        };
        this.messageEmitter.once(msg.id, handler);

        // Send + wait
        this.post(message);
        await Promise.race([finishPromise, sleep(timeout)]);

        // Cleanup - ensure both event emitter no longer holds reference to objects and promise is resolved
        this.messageEmitter.off(msg.id, handler);
        if (resolver) {
            (resolver as unknown as () => void)();
        }

        return result;
    }

    static buildFromWorker<
        TSendMessage extends IdCarrierOrTypeCarrier,
        TReceiveMessage extends IdCarrierOrTypeCarrier,
    >(worker: Worker) {
        return new WorkerRpc<TReceiveMessage, TSendMessage>(
            worker,
            this.#buildEventEmitter(worker),
        );
    }

    static buildFromMain<
        TSendMessage extends IdCarrierOrTypeCarrier,
        TReceiveMessage extends IdCarrierOrTypeCarrier,
    >(worker: Worker) {
        return new WorkerRpc<TSendMessage, TReceiveMessage>(
            worker,
            this.#buildEventEmitter(worker),
        );
    }

    static #buildEventEmitter(worker: Worker) {
        const evtSource = new EventEmitter();
        worker.onmessage = (evt) => {
            if (evt.data.id) {
                evtSource.emit(evt.data.id, evt.data);
            }

            if (evt.data.type) {
                evtSource.emit(evt.data.type, evt.data);
            }
        };
        return evtSource;
    }
}
