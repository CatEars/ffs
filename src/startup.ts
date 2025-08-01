import {
    cacheRootKey,
    customCommandsFileKey,
    requestLogsKey,
    setConfig,
    storeRootKey,
    usersFileKey,
} from './config.ts';
import { resolveCacheFolder } from './files/cache-folder.ts';
import { logger } from './logging/logger.ts';

function printBigWelcomeText() {
    logger.warn('');
    logger.warn(' ________    ________    _______      ');
    logger.warn('|\\   ____\\  |\\   ____\\  |\\  ____\\     ');
    logger.warn('\\ \\  \\__ |  \\ \\  \\__ |  \\ \\  \\____    ');
    logger.warn(
        ' \\ \\   __\\   \\ \\   __\\   \\ \\_____  \\      ',
    );
    logger.warn(
        '  \\ \\  \\_|    \\ \\  \\_|    \\|____|\\  \\    - Friendly File Server',
    );
    logger.warn('   \\ \\__\\      \\ \\__\\       ______\\  \\ ');
    logger.warn('    \\|__|       \\|__|      |\\_________\\');
    logger.warn('                           \\|_________|');
    logger.warn('');
}

export async function startup() {
    printBigWelcomeText();
    await setFirstTimeUserValuesIfLikely();
}

function isLikelyFirstTimeUser() {
    const vals = [
        usersFileKey,
        storeRootKey,
        cacheRootKey,
    ];

    return vals.every((x) => !Deno.env.get(x));
}

async function setFirstTimeUserValuesIfLikely() {
    if (isLikelyFirstTimeUser()) {
        printWelcomeHelper();
        setConfig({
            cacheRoot: await resolveCacheFolder(),
            storeRoot: '.',
            usersFilePath: 'data/users-file.json',
            requestLogsFile: 'access.log',
            customCommandsFile: './data/sample-custom-commands.json',
        });
    } else {
        if (!Deno.env.get(cacheRootKey)) {
            Deno.env.set(cacheRootKey, await resolveCacheFolder());
        }
        if (!Deno.env.get(requestLogsKey)) {
            Deno.env.set(requestLogsKey, 'access.log');
        }
        if (!Deno.env.get(customCommandsFileKey)) {
            Deno.env.set(customCommandsFileKey, '');
        }
    }
}

function printWelcomeHelper() {
    logger.warn('Seems like this is the first time you are using FFS.');
    logger.warn(
        'Go to   http://localhost:8080   and log on with:',
    );
    logger.warn('');
    logger.warn('   username: admin   password: ffsadmin');
    logger.warn('');
    logger.warn(
        'More information on creating a production worthy setup can be found',
    );
    logger.warn('in the project README.md. It is accessible from localhost:8080');
}
