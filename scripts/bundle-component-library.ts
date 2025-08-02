const command = new Deno.Command('deno', {
    args: ['bundle', 'index.js', 'index.bundle.js'],
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
} else {
    console.log('Bundled component library into index.bundle.js');
}
