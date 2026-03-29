const source = './data/favicon_io.tar.xz';
const dest = './src/app/website/static/';

const command = new Deno.Command('tar', {
    args: ['-xJf', source, '-C', dest],
});

const { success } = await command.output();

if (success) {
    try {
        Deno.removeSync(`${dest}about.txt`);
    } catch (e) {
        if (!(e instanceof Deno.errors.NotFound)) throw e;
    }
}
