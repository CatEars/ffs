import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { RecordingLogWrapper, FileLogger } from '../../../lib/logger/logger.ts';

// --- RecordingLogWrapper ---

Deno.test('RecordingLogWrapper forwards log calls to the wrapped logger', () => {
    const logged: unknown[][] = [];
    const fakeConsole = {
        debug: (...args: unknown[]) => logged.push(['debug', ...args]),
        log: (...args: unknown[]) => logged.push(['log', ...args]),
        warn: (...args: unknown[]) => logged.push(['warn', ...args]),
    };
    const wrapper = new RecordingLogWrapper(fakeConsole);
    wrapper.log('hello');
    wrapper.warn('uh oh');
    wrapper.debug('detail');
    assertEquals(logged.length, 3);
});

Deno.test('RecordingLogWrapper records logs for later inspection', () => {
    const fakeConsole = {
        debug: () => {},
        log: () => {},
        warn: () => {},
    };
    const wrapper = new RecordingLogWrapper(fakeConsole);
    wrapper.log('first');
    wrapper.log('second');
    const recent = wrapper.inspectRecentLogs();
    assertEquals(recent.length, 2);
});

Deno.test('RecordingLogWrapper keeps at most 1000 log entries (FIFO eviction)', () => {
    const fakeConsole = { debug: () => {}, log: () => {}, warn: () => {} };
    const wrapper = new RecordingLogWrapper(fakeConsole);
    for (let i = 0; i < 1100; i++) {
        wrapper.log('msg' + i);
    }
    assertEquals(wrapper.inspectRecentLogs().length, 1000);
});

Deno.test('RecordingLogWrapper with noPrefix omits timestamps', () => {
    const logged: string[][] = [];
    const fakeConsole = {
        debug: (...args: unknown[]) => logged.push(args as string[]),
        log: (...args: unknown[]) => logged.push(args as string[]),
        warn: (...args: unknown[]) => logged.push(args as string[]),
    };
    const wrapper = new RecordingLogWrapper(fakeConsole, true);
    wrapper.log('test message');
    assert(logged.length > 0);
    const firstArg = logged[0][0] as string;
    assert(!firstArg.startsWith('['));
});

// --- FileLogger ---

Deno.test('FileLogger writes log entries to a file', async () => {
    const tempFile = await Deno.makeTempFile();
    const logger = new FileLogger(() => tempFile);
    await logger.init();
    logger.info('hello from file logger');
    const content = await Deno.readTextFile(tempFile);
    assert(content.includes('hello from file logger'));
    await Deno.remove(tempFile);
});

Deno.test('FileLogger records recent logs for inspection', async () => {
    const tempFile = await Deno.makeTempFile();
    const logger = new FileLogger(() => tempFile);
    await logger.init();
    logger.info('entry one');
    logger.info('entry two');
    const recent = logger.inspectRecentLogs();
    assertEquals(recent.length, 2);
    await Deno.remove(tempFile);
});
