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

export const logger = {
    debug: function debug(...msg: Loggable[]) {
        console.debug(...generateLogLine(prefix(), 'color: grey', msg));
    },

    info: function info(...msg: Loggable[]) {
        console.log(...generateLogLine(prefix(), 'color: rgb(255, 255, 255)', msg));
    },

    warn: function warn(...msg: Loggable[]) {
        console.warn(...generateLogLine(prefix(), 'color: red', msg));
    },
};

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
