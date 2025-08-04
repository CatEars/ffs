export type BundleParams = {
    silent?: boolean;
};

async function bundleJavascriptWebComponentsLibrary(opts?: BundleParams) {
    const command = new Deno.Command('deno', {
        args: ['bundle', 'index.js', '--output', 'index.bundle.js'],
        cwd: './src/website/views/components',
    });

    const result = await command.output();
    if (!result.success) {
        console.error(
            'Failed to bundle component library!',
            new TextDecoder().decode(result.stdout),
            new TextDecoder().decode(result.stderr),
        );
        throw new Error('Could not bundle component library');
    } else if (!opts?.silent) {
        console.log('Bundled component library into index.bundle.js');
    }
}

async function bundleCssStyles(opts?: BundleParams) {
    const command = new Deno.Command('deno', {
        args: ['bundle', 'index.css', '--output', 'index.bundle.css'],
        cwd: './src/website/static/css',
    });

    const result = await command.output();
    if (!result.success) {
        console.error(
            'Failed to bundle CSS styles!',
            new TextDecoder().decode(result.stdout),
            new TextDecoder().decode(result.stderr),
        );
        throw new Error('Could not bundle CSS styles!');
    } else if (!opts?.silent) {
        console.log('Bundled CSS files into index.bundle.css');
    }
}

export async function bundle(opts?: BundleParams) {
    await bundleJavascriptWebComponentsLibrary(opts);
    await bundleCssStyles(opts);
}

if (import.meta.main) {
    await bundle();
}
