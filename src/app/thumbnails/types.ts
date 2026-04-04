export type ThumbnailRequest = {
    filePath: string;
    isFile: boolean;
    isDirectory: boolean;
};

export type ThumbnailContext = {
    searchObjectFullPath: string;
    isDirectory: boolean;
};

export type ThumbnailResult =
    | { type: 'thumbnail-not-found' }
    | { type: 'thumbnail-found'; root: string; path: string };
