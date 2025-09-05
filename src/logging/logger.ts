import { exists } from '@std/fs/exists';
import { getRequestLogsFile } from '../config.ts';

// deno-lint-ignore no-explicit-any
type Loggable = any;

type Logger = {
    debug(...msg: Loggable[]): void;
    log(...msg: Loggable[]): void;
    warn(...msg: Loggable[]): void;
};

function prefix(): string {
    const date = new Date();
    return `[${date.toISOString()}]`;
}

function stringify(obj: Loggable): string {
    if (obj instanceof String || typeof obj === 'string') {
        return obj.replaceAll('\n', '\\n');
    } else if (obj instanceof Error) {
        const x = `<${obj.name}|${obj.message}`;
        if (obj.cause) {
            return `${x}|${obj.cause}>`;
        } else {
            return `${x}>`;
        }
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
    const clearance = css.length > 0 ? ' %c' : ' ';
    return [(prefix + clearance).trimStart() + joined, css];
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
    private readonly wrappedConsole: Logger;
    private readonly logCache: FifoCache = new FifoCache(1000);
    private noPrefix: boolean;

    constructor(wrappedConsole: Logger, noPrefix: boolean = false) {
        this.wrappedConsole = wrappedConsole;
        this.noPrefix = noPrefix;
    }

    debug(...msg: Loggable[]) {
        const log = this.generate('color: grey', msg);
        this.wrappedConsole.debug(...log);
        this.addToCache(msg);
    }

    info(...msg: Loggable[]) {
        const log = this.generate('color: rgb(255, 255, 255)', msg);
        this.wrappedConsole.log(...log);
        this.addToCache(msg);
    }

    warn(...msg: Loggable[]) {
        const log = this.generate('color: red', msg);
        this.wrappedConsole.warn(...log);
        this.addToCache(msg);
    }

    addToCache(msg: Loggable[]) {
        if (this.noPrefix) {
            const logLine = generateLogLine('', '', msg);
            this.logCache.push(logLine);
        } else {
            const logLine = generateLogLine(prefix(), '', msg);
            this.logCache.push(logLine);
        }
    }

    inspectRecentLogs(): string[][] {
        return this.logCache;
    }

    generate(color: string, msg: Loggable[]) {
        if (this.noPrefix) {
            return generateLogLine('', color, msg);
        } else {
            return generateLogLine(prefix(), color, msg);
        }
    }

    skipPrefix() {
        this.noPrefix = true;
    }
}

export const logger = new RecordingLogWrapper(console);
export const backgroundProcessLogger = new RecordingLogWrapper(console);

class FileLogger {
    private readonly pathGetter: () => string;
    private file: Deno.FsFile | undefined;
    private logCache: FifoCache = new FifoCache(1000);
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
        const stringified = messages.map(stringify);
        const joined = stringified.join(' ') + '\n';
        this.file!.writeSync(FileLogger.Encoder.encode(joined));
        this.logCache.push(stringified);
    }

    inspectRecentLogs(): string[][] {
        return this.logCache;
    }
}

export const requestLogger = new FileLogger(getRequestLogsFile);

export async function initializeLoggers() {
    await requestLogger.init();
}
