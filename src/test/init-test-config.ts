import { setConfig } from '../app/config.ts';

setConfig({
    storeRoot: '.',
    usersFilePath: 'data/users-file.json',
    cacheRoot: Deno.makeTempDirSync(),
    requestLogsFile: Deno.makeTempFileSync(),
    customCommandsFile: '',
});
