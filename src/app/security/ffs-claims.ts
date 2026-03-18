import { getInstanceSecret } from '../config.ts';
import { ClaimCodec } from '../../lib/security/claims.ts';

export const claimsCodec = new ClaimCodec(getInstanceSecret());
