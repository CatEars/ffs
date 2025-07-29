const dls = [
  {
    url:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css",
    target: "./src/website/static/bootstrap.min.css",
    replace: [
      { pattern: "/*# sourceMappingURL=bootstrap.min.css.map */", into: "" },
    ],
  },
  {
    url:
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js",
    target: "./src/website/static/bootstrap.min.js",
    replace: [
      { pattern: "//# sourceMappingURL=bootstrap.bundle.min.js.map", into: "" },
    ],
  },
  {
    url: "https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js",
    target: "./src/website/static/alpine.min.js",
    prependedLicense: `/** 
# MIT License

Copyright © 2019-2021 Caleb Porzio and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
`,
  },
  {
    url:
      "https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/LICENSE",
    target: "./src/website/static/material-design-icons-license.txt",
  },
  {
    url: "https://esm.sh/preact@10.27.0/es2022/preact.mjs",
    target: "./src/website/views/components/vendor/preact.mjs",
  },
  {
    url: "https://esm.sh/preact@10.27.0/es2022/preact.mjs.map",
    target: "./src/website/views/components/vendor/preact.mjs.map",
  },
  {
    url: "https://esm.sh/htm@3.1.1/es2022/htm.mjs",
    target: "./src/website/views/components/vendor/htm.mjs",
  },
  {
    url: "https://esm.sh/htm@3.1.1/es2022/htm.mjs.map",
    target: "./src/website/views/components/vendor/htm.mjs.map",
  },
];

for (const { url, target, prependedLicense, replace } of dls) {
  try {
    Deno.removeSync(target);
  } catch (_error) {
    // Intentionally left empty
  }
  const targetFile = await Deno.open(target, { create: true, write: true });
  console.log("Downloading", url, "->", target);
  const req = await fetch(url);
  await req.body?.pipeTo(targetFile.writable);
  let text = new TextDecoder("utf-8").decode(Deno.readFileSync(target));
  if (prependedLicense) {
    console.log("  Prepending license");
    text = prependedLicense + text;
  }
  if (replace) {
    for (const { pattern, into } of replace) {
      console.log(`  Replacing '${pattern}' with '${into}'`);
      text = text.replaceAll(pattern, into);
    }
  }
  Deno.writeFileSync(target, new TextEncoder().encode(text));
}
