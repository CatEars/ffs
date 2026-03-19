import { Buffer } from 'node:buffer';
import { stdin } from 'node:process';
import { Logger } from '../logger/logger.ts';

// deno-lint-ignore no-explicit-any
type HandlerData = any;

export class IpcPipe {
    private static readonly encoder: TextEncoder = new TextEncoder();
    private static readonly decoder: TextDecoder = new TextDecoder();
    private readonly name: string;
    private readonly logger: Logger;
    private readonly listenersByTypeName: Map<string, ((data: HandlerData) => void)[]> = new Map();
    private writer?: WritableStreamDefaultWriter<Uint8Array>;

    constructor(name: string, logger: Logger) {
        this.name = name;
        this.logger = logger;
    }

    on<T>(eventType: string, dataHandler: (data: T) => void) {
        if (!this.listenersByTypeName.get(eventType)) {
            this.listenersByTypeName.set(eventType, []);
        }
        this.listenersByTypeName.get(eventType)?.push((d) => dataHandler(d));
    }

    async post<T>(eventType: string, data: T) {
        if (this.writer === undefined) {
            throw new Error(
                `The IPC Pipe must have a writer set with setIpcWriter(stream) to be able to post data`,
            );
        }
        const formatted = JSON.stringify({ type: eventType, data });
        const bytes = IpcPipe.encoder.encode(formatted + '\n');
        await this.writer.write(bytes);
    }

    setIpcWriter(stream: WritableStreamDefaultWriter<Uint8Array>) {
        if (this.writer !== undefined) {
            throw new Error(
                `The IPC Pipe has already a writer, it is not possible to set a second one`,
            );
        }
        this.writer = stream;
    }

    setIpcReader(stream: NodeJS.ReadStream) {
        stream.addListener('data', (data) => this.#onData(data));
    }

    listenToStdin() {
        this.setIpcReader(stdin);
    }

    #onData(data: Buffer<ArrayBufferLike>) {
        const request = IpcPipe.decoder.decode(data);
        const lines = request.split('\n');
        for (const line of lines) {
            if (!line.trim()) {
                continue;
            }

            try {
                const parsed = JSON.parse(line) || {};
                if (parsed.type) {
                    this.#callListeners(parsed.type, parsed.data);
                }
            } catch (err) {
                this.logger.warn(
                    `Tried to read data from <IpcPipe name="${this.name}" /> but got error:`,
                    err,
                );
            }
        }
    }

    #callListeners(_type: string, data: HandlerData) {
        const listeners = this.listenersByTypeName.get(_type);
        if (listeners) {
            for (const listener of listeners) {
                listener(data);
            }
        }
    }
}
