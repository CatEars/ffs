Deno.env.set('FFS_ENV', 'dev');
Deno.env.set('FFS_STORE_ROOT', '.');
Deno.env.set('FFS_USERS_FILE', 'data/users-file.json');
Deno.env.set('FFS_CUSTOM_COMMANDS_FILE', 'data/sample-custom-commands.json');
Deno.env.set('FFS_INSTANCE_SECRET', 'VerySecretIndeed');

const { bundle } = await import('./bundle-component-library.ts');
await bundle();
setInterval(async () => {
    try {
        await bundle({
            silent: true,
        });
    } catch (err) {
        console.error('Failed to bundle', err);
    }
}, 5000);
await import('../src/main.ts');
