export type DiskUsageWorkerRequest =
    | { type: 'get-usage'; path: string; id: string }
    | { type: 'activate' }
    | { type: 'deactivate' }
    | { type: 'echo' };

export type DiskUsageWorkerResponse =
    | { type: 'usage-result'; id: string; sizeBytes: number | null }
    | { type: 'echo' };
