export type ShareContext = {
    paths: string[];
};

export type DecodedShare = {
    paths: string[];
};

export interface ShareLinkProtocol {
    protocolId(): string;
    isAvailable(ctx: ShareContext): boolean;
    createCode(ctx: ShareContext): string;
    decodeCode(code: string): DecodedShare;
}
