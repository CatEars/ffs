import { exists } from '@std/fs/exists';
import { getRequestLogsFile } from '../config.ts';

// deno-lint-ignore no-explicit-any
type Loggable = any;

function prefix(): string {
    const date = new Date();
    return `[${date.toISOString()}]`;
}

function stringify(obj: Loggable): string {
    if (typeof obj === 'string') {
        return obj.replaceAll('\n', '\\n');
    } else {
        return JSON.stringify(obj);
    }
}

function generateLogLine(
    prefix: string,
    css: string,
    messages: Loggable[],
) {
    const joined = messages.map(stringify).join(' ');
    return [prefix + ' %c' + joined, css];
}

class FifoCache extends Array {
    private readonly maxSize: number;

    constructor(size: number) {
        super();
        this.maxSize = size;
    }

    override push(...items: Loggable[]): number {
        const extraLen = items.length;
        while (this.length > this.maxSize - extraLen) {
            this.shift();
        }

        return super.push(...items);
    }
}

class RecordingLogWrapper {
    private readonly wrappedConsole: Console;
    private readonly logCache: FifoCache = new FifoCache(
        1000,
    );

    constructor(wrappedConsole: Console) {
        this.wrappedConsole = wrappedConsole;
    }

    debug(...msg: Loggable[]) {
        const log = generateLogLine(prefix(), 'color: grey', msg);
        this.wrappedConsole.debug(...log);
        this.logCache.push([prefix(), ...msg]);
    }

    info(...msg: Loggable[]) {
        const log = generateLogLine(prefix(), 'color: rgb(255, 255, 255)', msg);
        this.wrappedConsole.log(...log);
        this.logCache.push([prefix(), ...msg]);
    }

    warn(...msg: Loggable[]) {
        const log = generateLogLine(prefix(), 'color: red', msg);
        this.wrappedConsole.warn(...log);
        this.logCache.push([prefix(), ...msg]);
    }

    inspectRecentLogs(): string[][] {
        return this.logCache;
    }
}

export const logger = new RecordingLogWrapper(console);

class FileLogger {
    private readonly pathGetter: () => string;
    private file: Deno.FsFile | undefined;
    private static Encoder: TextEncoder = new TextEncoder();

    constructor(pathGetter: () => string) {
        this.pathGetter = pathGetter;
    }

    async init() {
        if (await exists(this.pathGetter())) {
            this.file = await Deno.open(this.pathGetter(), { append: true });
        } else {
            this.file = await Deno.open(this.pathGetter(), {
                create: true,
                write: true,
            });
        }
    }

    info(...msg: Loggable[]) {
        this.append([prefix()].concat(msg));
    }

    private append(messages: Loggable[]) {
        const joined = messages.map(stringify).join(' ') + '\n';
        this.file!.writeSync(FileLogger.Encoder.encode(joined));
    }
}

export const requestLogger = new FileLogger(getRequestLogsFile);

export async function initializeLoggers() {
    await requestLogger.init();
}
