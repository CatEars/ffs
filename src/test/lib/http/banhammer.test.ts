import { assertEquals } from '@std/assert/equals';
import { assert } from '@std/assert/assert';
import { forgeBanhammer } from '../../../lib/http/banhammer.ts';
import type { Context, Next } from '@oak/oak';

function makeCtx(ip: string): { ctx: Context; getStatus: () => number | undefined } {
    let status: number | undefined = undefined;
    const ctx = {
        request: { ip },
        response: {
            get status() {
                return status;
            },
            set status(value: number) {
                status = value;
            },
        },
    } as unknown as Context;
    return { ctx, getStatus: () => status };
}

const noopNext: Next = () => Promise.resolve();

Deno.test(
    'forgeBanhammer allows requests below the threshold',
    { sanitizeOps: false, sanitizeResources: false },
    async () => {
        const banhammer = forgeBanhammer({ maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: 5 });
        const { ctx, getStatus } = makeCtx('1.2.3.4');

        for (let i = 0; i < 5; i++) {
            await banhammer(ctx, noopNext);
        }

        assertEquals(getStatus(), undefined);
    },
);

Deno.test(
    'forgeBanhammer blocks requests at or above the threshold',
    { sanitizeOps: false, sanitizeResources: false },
    async () => {
        const banhammer = forgeBanhammer({ maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: 3 });
        const { ctx, getStatus } = makeCtx('10.0.0.1');

        for (let i = 0; i < 3; i++) {
            await banhammer(ctx, noopNext);
        }
        await banhammer(ctx, noopNext);

        assert(getStatus() !== undefined);
    },
);

Deno.test(
    'forgeBanhammer tracks different IPs independently',
    { sanitizeOps: false, sanitizeResources: false },
    async () => {
        const banhammer = forgeBanhammer({ maximumRequestsBeforeTheBanhammerStrikesPerFiveSeconds: 3 });
        const ip1 = makeCtx('192.168.1.1');
        const ip2 = makeCtx('192.168.1.2');

        for (let i = 0; i < 4; i++) {
            await banhammer(ip1.ctx, noopNext);
        }

        await banhammer(ip2.ctx, noopNext);

        assert(ip1.getStatus() !== undefined);
        assertEquals(ip2.getStatus(), undefined);
    },
);
