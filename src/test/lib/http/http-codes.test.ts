import { assertEquals } from '@std/assert/equals';
import {
    HTTP_200_OK,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
} from '../../../lib/http/http-codes.ts';

Deno.test('HTTP status codes have the correct numeric values', () => {
    assertEquals(HTTP_200_OK, 200);
    assertEquals(HTTP_400_BAD_REQUEST, 400);
    assertEquals(HTTP_401_UNAUTHORIZED, 401);
    assertEquals(HTTP_403_FORBIDDEN, 403);
    assertEquals(HTTP_404_NOT_FOUND, 404);
    assertEquals(HTTP_500_INTERNAL_SERVER_ERROR, 500);
});
