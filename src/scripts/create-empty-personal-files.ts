const filesToCreate = [
    './src/app/website/templates/base.personal.html',
];

for (const file of filesToCreate) {
    Deno.writeTextFileSync(file, '');
}
