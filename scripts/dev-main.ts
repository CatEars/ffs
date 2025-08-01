Deno.env.set('FFS_ENV', 'dev');
Deno.env.set('FFS_STORE_ROOT', '.');
Deno.env.set('FFS_USERS_FILE', 'data/users-file.json');
Deno.env.set('FFS_CUSTOM_COMMANDS_FILE', 'data/sample-custom-commands.json');

await import('../src/main.ts');
