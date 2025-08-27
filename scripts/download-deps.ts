import { dirname } from '@std/path/dirname';

const dls: { url: string; target: string; prependedLicense?: string }[] = [
    {
        url: 'https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/LICENSE',
        target: './src/website/static/material-design-icons-license.txt',
    },
    {
        url: 'https://esm.sh/preact@10.27.0/es2022/preact.mjs',
        target: './src/website/components/vendor/preact.mjs',
    },
    {
        url: 'https://esm.sh/preact@10.27.0/es2022/preact.mjs.map',
        target: './src/website/components/vendor/preact.mjs.map',
    },
    {
        url: 'https://esm.sh/htm@3.1.1/es2022/htm.mjs',
        target: './src/website/components/vendor/htm.mjs',
    },
    {
        url: 'https://esm.sh/htm@3.1.1/es2022/htm.mjs.map',
        target: './src/website/components/vendor/htm.mjs.map',
    },
];

for (const { url, target, prependedLicense } of dls) {
    try {
        Deno.removeSync(target);
    } catch (_error) {
        // Intentionally left empty
    }
    await Deno.mkdir(dirname(target), { recursive: true });
    const targetFile = await Deno.open(target, { create: true, write: true });
    console.log('Downloading', url, '->', target);
    const req = await fetch(url);
    await req.body?.pipeTo(targetFile.writable);
    let text = new TextDecoder('utf-8').decode(Deno.readFileSync(target));
    if (prependedLicense) {
        console.log('  Prepending license');
        text = prependedLicense + text;
    }
    Deno.writeFileSync(target, new TextEncoder().encode(text));
}
