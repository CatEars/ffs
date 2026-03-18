import { existsSync } from 'node:fs';
import { getCustomCommandsFile } from '../config.ts';
import { logger } from '../logging/logger.ts';

export type CustomCommand = {
    program: string;
    nargs: number;
    args: string[];
};

export function getCustomCommands(): CustomCommand[] {
    const customCommandsFile = getCustomCommandsFile();
    if (!customCommandsFile) {
        return [];
    }
    if (existsSync(customCommandsFile)) {
        try {
            return JSON.parse(
                new TextDecoder().decode(Deno.readFileSync(customCommandsFile)),
            );
        } catch (error) {
            logger.warn(
                `Tried to read ${customCommandsFile} for custom commands, but got error ${error} when parsing the file`,
            );
            return [];
        }
    } else {
        logger.warn(
            `Expected a file with custom commands to exist at ${customCommandsFile} but none was found`,
        );
        return [];
    }
}
