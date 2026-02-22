export type ShareContext = {
    paths: string[];
};

export type DecodedShare = {
    paths: string[];
};

export interface ShareLinkScheme {
    schemeId(): string;
    isAvailable(ctx: ShareContext): Promise<boolean>;
    createCode(ctx: ShareContext): Promise<string>;
    decodeCode(code: string): Promise<DecodedShare>;
}
