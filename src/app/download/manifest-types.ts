export type FileDescriptorForManifest = {
    name: string;
    directoryPath: string;
    rootRelativeDirectoryPath: string;
    size: number;
    isFile: boolean;
    isDirectory: boolean;
};

export type DownloadManifest = {
    id: string;
    files: FileDescriptorForManifest[];
    mode: 'single' | 'archive';
};
