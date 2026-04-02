export type ThumbnailRequest = {
    filePath: string;
    isFile: boolean;
    isDirectory: boolean;
};

export type ThumbnailContext = {
    resolvedFullPath: string;
    isDirectory: boolean;
};

export type ThumbnailResult =
    | { type: 'ThumbnailNotFound' }
    | { type: 'ThumbnailFound'; root: string; path: string };
