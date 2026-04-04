import { Logger } from '../logger/logger.ts';

export interface OptionalModule {
    name: string;
    isAvailable(): Promise<boolean>;
    init(): Promise<void>;
    isActivated(): boolean;
    activate(): Promise<void>;
    deactivate(): Promise<void>;
    warnUnavailableOnStartup(logger: Logger): void;
}
