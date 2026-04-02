export type ThumbnailRequest = {
    filePath: string;
    isFile: boolean;
    isDirectory: boolean;
};

export type ThumbnailResult =
    | { type: 'ThumbnailNotFound' }
    | { type: 'ThumbnailFound'; contentType: string; body: string | Uint8Array };
