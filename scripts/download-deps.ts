const dls = [
  {
    url:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css",
    target: "./src/website/static/bootstrap.min.css",
  },
  {
    url:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js",
    target: "./src/website/static/bootstrap.min.js",
  },
];

for (const { url, target } of dls) {
  const targetFile = await Deno.open(target, { create: true, write: true });
  console.log("Downloading", url, "->", target);
  const req = await fetch(url);
  await req.body?.pipeTo(targetFile.writable);
}
