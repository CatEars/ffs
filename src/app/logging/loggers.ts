import { FileLogger, RecordingLogWrapper } from '../../lib/logger/logger.ts';
import { getRequestLogsFile } from '../config.ts';

export const requestLogger = new FileLogger(getRequestLogsFile);
export const logger = new RecordingLogWrapper(console);
export const backgroundProcessLogger = new RecordingLogWrapper(console);

export async function initializeLoggers() {
    await requestLogger.init();
}
