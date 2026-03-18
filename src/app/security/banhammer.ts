import { Context, Next } from '@oak/oak';
import {
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
} from '../utils/http-codes.ts';

const maximumRequestBeforeTheBanhammerStrikesDefault = 250;

export type BanhammerOptions = {
    maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: number;
};

let bannedIps = new Set<string>();
let lastBannedIpsRotation = Date.now();
const timeUntilNextBannedIpsRotation = 1000 /* ms -> s */ * 60 /* s -> m */ *
    60 /* m -> h */ * 12; /* h -> 12h */

const httpStatusCodes = [
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
];
const statusCodeLen = httpStatusCodes.length;

export function forgeBanhammer(options?: Partial<BanhammerOptions>) {
    options = options ?? {};
    const actualOptions: BanhammerOptions = {
        maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds:
            options.maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds ??
                maximumRequestBeforeTheBanhammerStrikesDefault,
    };
    let requestCounter = new Map<string, number>();

    setInterval(() => {
        requestCounter = new Map<string, number>();
        for (const bannedIp of bannedIps) {
            requestCounter.set(
                bannedIp,
                actualOptions.maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds,
            );
        }
        const now = Date.now();
        if (now > lastBannedIpsRotation + timeUntilNextBannedIpsRotation) {
            bannedIps = new Set<string>();
            lastBannedIpsRotation = Date.now();
        }
    }, 5000);

    return (ctx: Context, next: Next) => {
        const ip = ctx.request.ip;
        const numRequests = requestCounter.get(ip) || 0;
        requestCounter.set(ip, numRequests + 1);
        if (
            numRequests <
                actualOptions.maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds
        ) {
            return next();
        } else if (
            numRequests <
                actualOptions.maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds +
                    10
        ) {
            bannedIps.add(ip);
        }
        ctx.response.status = httpStatusCodes[numRequests % statusCodeLen];
    };
}
