# Manual Test: Pagination Control

## Prerequisites
- Run `deno task generate-default-test-bench` from the project root
- Start the server with `deno task run` and log in

## Test Data
| Path | Files | Pages at size 100 |
|------|-------|-------------------|
| `testbench/long-filenames` | 20 | 1 |
| `testbench/many-files` | 17,576 | 176 |

## Steps

**Single page**

1. Navigate to `/home/?path=testbench%2Flong-filenames`  
   → `< [1] >`, both arrows disabled

**Small pagination — no ellipsis**

2. In Options, set page size to 5  
   → `< [1] 2 3 4 >`, no ellipsis, `>` enabled

3. Click `>`  
   → `< 1 [2] 3 4 >`, `<` now enabled

4. Click page `4`  
   → `< 1 2 3 [4] >`, `>` disabled

**Large pagination — ellipsis**

5. In Options, reset page size to 100

6. Navigate to `/home/?path=testbench%2Fmany-files`  
   → `< [1] 2 3 ... 176 >`, `<` disabled

7. Click `>`  
   → `< 1 [2] 3 4 ... 176 >`

8. Navigate to `/home/?path=testbench%2Fmany-files&page=88`  
   → `< 1 ... 86 87 [88] 89 90 ... 176 >`, ellipsis on both sides

9. Click `<`  
   → `< 1 ... 85 86 [87] 88 89 ... 176 >`

10. Click page `176`  
    → `< 1 ... 174 175 [176] >`, `>` disabled

11. Click `[176]` (current page)  
    → Page unchanged, `>` remains disabled
