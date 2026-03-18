const filesToCreate = [
    './src/app/website/views/templates/base.personal.html',
];

for (const file of filesToCreate) {
    Deno.writeTextFileSync(file, '');
}
