export const prioritizeThumbnailEvent = 'prioritize-thumbnail';

export type ThumbnailRequest = {
    filePath: string;
    isFile: boolean;
    isDirectory: boolean;
};
