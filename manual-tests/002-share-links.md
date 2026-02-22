# Manual Test: Share Links

## Prerequisites
- Run `deno task generate-default-test-bench` from the project root
- Start the server with `deno task run` and log in

## Steps

**Single-file share**

1. Navigate to `/home/?path=testbench%2Fmany-files`  
   → Directory contents are listed

2. Check the checkbox next to `aaa.txt`

3. Click the Share button in the footer  
   → Browser redirects to `/share-file/view?code=<signed-code>`

4. Inspect the page  
   → `testbench/many-files/aaa.txt` is listed with a download link

5. Click the download link  
   → `aaa.txt` is downloaded

**Multi-file share**

6. Navigate to `/home/?path=testbench%2Fmany-files`

7. Check the checkboxes next to `aaa.txt`, `aab.txt`, and `aac.txt`

8. Click the Share button  
   → Browser redirects to `/share-file/view?code=<signed-code>`

9. Inspect the page  
   → All three files are listed, each with its own download link

10. Click the download link for `aab.txt`  
    → `aab.txt` is downloaded (not `aaa.txt` or `aac.txt`)

**Tampered code — 401**

11. Copy the full URL from step 8

12. In the address bar, replace one character in the `code` query parameter value and navigate to the modified URL

13. Open the browser's developer tools and inspect network requests  
    → The request to `/api/share-file/list` returns `401 Unauthorized`

**Missing code — 400**

14. Navigate to `/api/share-file/list` (no `code` parameter in the URL)  
    → Response is `400 Bad Request`

**Large selection — manifest scheme**

15. Navigate to `/home/?path=testbench%2Flong-filenames`  
    → 20 files with progressively longer names are listed

16. Check the checkbox for every file in the directory (all 20 files)

17. Click the Share button  
    → Browser redirects to `/share-file/view?code=<signed-code>`  
    → The `code` parameter is short (roughly 200 characters), even though encoding 20 long paths inline would require thousands of characters

18. Inspect the page  
    → All 20 files are listed, each with a download link

19. Click any download link  
    → The correct file is downloaded
