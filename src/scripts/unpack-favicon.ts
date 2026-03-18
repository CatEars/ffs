import { zip } from '@deno-library/compress';

console.log('Unpacking ./data/favicon_io.zip to static website assets folder');
await zip.uncompress('./data/favicon_io.zip', './src/app/website/static/');
Deno.removeSync('./src/app/website/static/about.txt');
