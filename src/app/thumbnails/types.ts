export type ThumbnailRequest = {
    filePath: string;
    isFile: boolean;
    isDirectory: boolean;
    id?: string;
};

export type ThumbnailWorkerRequest =
    | {
        type: 'create-thumbnail';
    } & ThumbnailRequest
    | ({
        type: 'activate';
    })
    | ({
        type: 'deactivate';
    })
    | ({
        type: 'echo';
    });

export type ThumbnailWorkerFoundThumbnail = {
    path: string;
};

export type ThumbnailWorkerResponse =
    | {
        type: 'thumbnail-found';
        id: string;
    } & ThumbnailWorkerFoundThumbnail
    | {
        type: 'thumbnail-not-found';
        id: string;
    }
    | {
        type: 'echo';
    };

export type ThumbnailContext = {
    searchObjectFullPath: string;
    isDirectory: boolean;
};

export type ThumbnailLocation = {
    root: string;
    path: string;
};

export type ThumbnailResult =
    | { type: 'thumbnail-not-found' }
    | { type: 'thumbnail-found' } & ThumbnailLocation;
