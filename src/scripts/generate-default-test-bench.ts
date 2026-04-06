import { join } from '@std/path/join';

const albumArtSourcePath = new URL(
    '../app/website/static/android-chrome-192x192.png',
    import.meta.url,
).pathname;

type TestGenerator = {
    name: string;
    generator: (path: string) => Promise<void>;
};

function generateRandomAlphanumeric(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function createProgressivelyLongerFiles(
    directoryPath: string,
): Promise<void> {
    const numberOfFiles: number = 20,
        maxFilenameLength: number = 100;
    const lengthIncrement = Math.floor(maxFilenameLength / numberOfFiles);

    for (let i = 0; i < numberOfFiles; i++) {
        const filenameLength = Math.min(1 + i * lengthIncrement, maxFilenameLength);

        const filename = generateRandomAlphanumeric(filenameLength) + '.txt';
        const filePath = join(directoryPath, filename);

        try {
            await Deno.writeTextFile(filePath, '');
            console.log(`Created file: ${filePath} (length: ${filenameLength})`);
        } catch (error) {
            console.error(`Failed to create file "${filePath}":`, error);
        }
    }
    console.log(`Successfully created ${numberOfFiles} files in "${directoryPath}".`);
}

function generateUncommonFilename(): string {
    const uncommonChars = [
        // Emojis
        '😀',
        '👍',
        '🚀',
        '💡',
        '❤️',
        '🌟',
        '🎉',
        '🔥',
        '🎶',
        // Chinese/Kanji
        '你好',
        '世界',
        '漢字',
        '龍',
        '鳳',
        // Thai
        'สวัสดี',
        'ครับ',
        'ภาษาไทย',
        // Korean (Hangul)
        '안녕하세요',
        '한글',
        '사랑',
        // German Umlauts
        'ä',
        'ö',
        'ü',
        'Ä',
        'Ö',
        'Ü',
        // Other accented/extended Latin characters
        'é',
        'à',
        'è',
        'ù',
        'ì',
        'ò',
        'ñ',
        'ç',
        'ß',
        'É',
        'À',
        'È',
        'Ù',
        'Ì',
        'Ò',
        'Ñ',
        'Ç',
        // Some less common Latin extensions
        'ŋ',
        'ɖ',
        'ɛ',
        'ə',
        'œ',
        'ø',
        'æ',
        'þ',
        'ð',
        // Greek
        'α',
        'β',
        'γ',
        'δ',
        'ε',
        // Cyrillic
        'Привет',
        'Мир',
        'Москва',
    ];

    let filename = '';
    const numParts = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < numParts; i++) {
        const char = uncommonChars[Math.floor(Math.random() * uncommonChars.length)];
        filename += char;
    }

    filename += Math.random().toString(36).substring(2, 8);
    return filename;
}

async function createUncommonCharacterFiles(
    directoryPath: string,
): Promise<void> {
    const numberOfFiles: number = 20;
    for (let i = 0; i < numberOfFiles; i++) {
        const filename = generateUncommonFilename();
        const filePath = join(directoryPath, filename);

        try {
            await Deno.writeTextFile(filePath, `This is file number ${i + 1}.`);
            console.log(`Created file: ${filePath}`);
        } catch (error) {
            console.error(`Failed to create file "${filePath}":`, error);
        }
    }
    console.log(
        `Successfully created ${numberOfFiles} files in "${directoryPath}" with uncommon characters.`,
    );
}

async function createAlphabeticFiles(directoryPath: string): Promise<void> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let filesCreatedCount = 0;

    for (let i = 0; i < alphabet.length; i++) {
        for (let j = 0; j < alphabet.length; j++) {
            for (let k = 0; k < alphabet.length; k++) {
                const filename = `${alphabet[i]}${alphabet[j]}${alphabet[k]}.txt`;
                const filePath = join(directoryPath, filename);

                try {
                    await Deno.writeTextFile(filePath, '');
                    filesCreatedCount++;
                } catch (error) {
                    console.error(`Failed to create file "${filePath}":`, error);
                }
            }
        }
    }
    console.log(`Successfully created ${filesCreatedCount} files in "${directoryPath}".`);
}

async function createDeeplyNestedFiles(
    basePath: string,
    filesPerDirectory: number = 20,
    filenameLength: number = 8,
): Promise<void> {
    const depth = 10;
    let currentDirPath = basePath;

    for (let dir = 0; dir < depth; ++dir) {
        try {
            await Deno.mkdir(currentDirPath, { recursive: true });
        } catch (error) {
            console.error(`Failed to create directory "${currentDirPath}":`, error);
            return;
        }

        for (let i = 0; i < filesPerDirectory; i++) {
            const filename = generateRandomAlphanumeric(filenameLength);
            const filePath = join(currentDirPath, filename);

            try {
                await Deno.writeTextFile(filePath, '');
            } catch (error) {
                console.error(`Failed to create file "${filePath}":`, error);
            }
        }

        currentDirPath = join(currentDirPath, generateRandomAlphanumeric(10));
    }
}

async function createAudioAlbums(basePath: string): Promise<void> {
    const albums = [
        {
            name: 'Cosmic Llama - Songs From the Void',
            artFiles: ['front.jpg', 'back.jpg'],
            tracks: [
                '01 - Into the Void.mp3',
                '02 - Space Llama Shuffle.mp3',
                '03 - Galactic Spit (Extended Mix).mp3',
                '04 - Event Horizon Boogie.mp3',
            ],
            readme: 'Tests: MP3 album with two art files (front.jpg + back.jpg).',
        },
        {
            name: 'Professor Bongo & The Time Weasels - Live at the Cheese Factory',
            artFiles: ['AlbumArt.jpg'],
            tracks: [
                '01 - Cheese Waltz in Eb Major.mp3',
                '02 - Weasel Stampede.mp3',
                '03 - The Professors Lament.mp3',
                '04 - Encore Encore (Reprise).mp3',
            ],
            readme:
                'Tests: MP3 album with a single art file named AlbumArt.jpg (Windows Media Player convention).',
        },
        {
            name: 'The Spectacular Turnip Orchestra - Greatest Ringtones',
            artFiles: ['cover.jpg'],
            tracks: [
                '01 - Ringtone No. 1 in D Minor.mp3',
                '02 - Hold Music Fantasia.mp3',
                '03 - Elevator Jazz Supreme.mp3',
            ],
            readme:
                'Tests: MP3 album with a single art file named cover.jpg (common open-source player convention).',
        },
        {
            name: 'DJ Sprocket & MC Spatula - Breakfast Bangers Vol. 2',
            artFiles: ['folder.jpg'],
            tracks: [
                '01 - Waffle Drop.mp3',
                '02 - Pancake Flip (feat. The Syrup Collective).mp3',
                '03 - Scrambled Eggs Remix.mp3',
                '04 - Omelette du Jour (Radio Edit).mp3',
            ],
            readme:
                'Tests: MP3 album with a single art file named folder.jpg (Windows Explorer thumbnail convention).',
        },
        {
            name: 'The Invisible Ukulele Ensemble - Self-Titled',
            artFiles: [],
            tracks: [
                '01 - Transparent Chords.mp3',
                '02 - You Cant See Me But You Can Hear Me.mp3',
                '03 - The Soundless Sound.mp3',
            ],
            readme: 'Tests: MP3 album with no album art at all.',
        },
        {
            name: 'Sir Reginald Fluffington III - Opus for Cats and Thunderstorms',
            artFiles: ['front.jpg', 'back.jpg'],
            tracks: [
                'Track01.wav',
                'Track02.wav',
                'Track03.wav',
                'Track04.wav',
                'Track05.wav',
            ],
            readme:
                'Tests: WAV album (typical CD-rip layout) with two art files (front.jpg + back.jpg) and generic track names.',
        },
    ];

    for (const album of albums) {
        const albumDir = join(basePath, album.name);
        await Deno.mkdir(albumDir, { recursive: true });

        for (const artFile of album.artFiles) {
            const artPath = join(albumDir, artFile);
            await Deno.copyFile(albumArtSourcePath, artPath);
            console.log(`Created album art: ${artPath}`);
        }

        for (const track of album.tracks) {
            const trackPath = join(albumDir, track);
            await Deno.writeFile(trackPath, new Uint8Array(0));
            console.log(`Created track: ${trackPath}`);
        }

        const readmePath = join(albumDir, 'readme.txt');
        await Deno.writeTextFile(readmePath, album.readme + '\n');
        console.log(`Created readme: ${readmePath}`);
    }
}

const generators: TestGenerator[] = [
    {
        name: 'long-filenames',
        generator: createProgressivelyLongerFiles,
    },
    {
        name: '오빠-이모지-스타일',
        generator: createUncommonCharacterFiles,
    },
    {
        name: 'many-files',
        generator: createAlphabeticFiles,
    },
    {
        name: 'deep-nesting',
        generator: createDeeplyNestedFiles,
    },
    {
        name: 'music-library',
        generator: createAudioAlbums,
    },
];

for (const generator of generators) {
    const directory = join('testbench', generator.name);
    await Deno.mkdir(directory, { recursive: true });
    await generator.generator(directory);
}
