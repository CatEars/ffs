import { join } from '@std/path/join';
import { basename } from '@std/path/basename';

const INPUT_FOLDER = './src/website/static/svg';
const OUTPUT_FILE = './src/website/static/svg/sprite_sheet.svg';

const SVG_SPRITE_HEADER = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n`;
const SVG_SPRITE_FOOTER = `\n</svg>`;

async function generateSvgSpriteSheet() {
    try {
        const spriteSymbols: string[] = [];

        for await (const dirEntry of Deno.readDir(INPUT_FOLDER)) {
            if (dirEntry.isFile && dirEntry.name.endsWith('.svg')) {
                const filePath = join(INPUT_FOLDER, dirEntry.name);

                const svgContent = await Deno.readTextFile(filePath);

                const iconId = basename(dirEntry.name, '.svg');

                const pathMatch = svgContent.match(/<path\s+d="([^"]+)"/);

                if (pathMatch) {
                    const pathData = pathMatch[1];

                    const symbol = `  <symbol id="${iconId}" viewBox="0 -960 960 960">
    <path d="${pathData}" />
  </symbol>`;

                    spriteSymbols.push(symbol);
                } else {
                    console.warn(`Could not find a <path> or viewBox in ${dirEntry.name}`);
                }
            }
        }

        spriteSymbols.sort();
        const finalSpriteContent = SVG_SPRITE_HEADER + spriteSymbols.join('\n\n') +
            SVG_SPRITE_FOOTER;

        await Deno.writeTextFile(OUTPUT_FILE, finalSpriteContent);

        console.log(`Successfully created SVG sprite sheet at ${OUTPUT_FILE}`);
        console.log(`Contains ${spriteSymbols.length} icons.`);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

generateSvgSpriteSheet();
