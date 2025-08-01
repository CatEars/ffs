import { zip } from 'jsr:@deno-library/compress';

console.log('Unpacking ./data/favicon_io.zip to static website assets folder');
await zip.uncompress('./data/favicon_io.zip', './src/website/static/');
Deno.removeSync('./src/website/static/about.txt');
