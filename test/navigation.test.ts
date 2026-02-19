import { assert } from '@std/assert/assert';
import { assertEquals } from '@std/assert/equals';
import { baseUrl } from './constants.ts';
import { HTTP_200_OK } from '../src/utils/http-codes.ts';
import { authenticatedFetch } from './authenticated-fetch.ts';

type FileListing = {
    name: string;
    isFile: boolean;
};

Deno.test('Page navigation works with testbench data', async () => {
    const ELLIPSIS_THRESHOLD = 7;
    const MAX_PAGE_SIZE = 1000;

    const manyFilesResponse = await authenticatedFetch(
        baseUrl + '/api/directory?path=testbench/many-files',
    );
    assertEquals(manyFilesResponse.status, HTTP_200_OK);
    const manyFiles: FileListing[] = await manyFilesResponse.json();
    assert(
        manyFiles.length > ELLIPSIS_THRESHOLD * MAX_PAGE_SIZE,
        `Expected more than ${ELLIPSIS_THRESHOLD * MAX_PAGE_SIZE} files so ellipsis pagination is triggered even at max page size, got ${manyFiles.length}`,
    );

    const deepNestingResponse = await authenticatedFetch(
        baseUrl + '/api/directory?path=testbench/deep-nesting',
    );
    assertEquals(deepNestingResponse.status, HTTP_200_OK);
    const deepNesting: FileListing[] = await deepNestingResponse.json();
    const subdirectory = deepNesting.find((f) => !f.isFile);
    assert(
        subdirectory !== undefined,
        'Expected deep-nesting to contain a subdirectory for multi-level breadcrumb navigation',
    );

    const subdirectoryName = subdirectory.name;
    const nestedPath = `testbench/deep-nesting/${subdirectoryName}`;
    const homeResponse = await authenticatedFetch(
        baseUrl + `/home/?path=${encodeURIComponent(nestedPath)}`,
    );
    await homeResponse.body?.cancel();
    assertEquals(
        homeResponse.status,
        HTTP_200_OK,
        `Expected home page to be accessible at nested path "${nestedPath}"`,
    );
});
