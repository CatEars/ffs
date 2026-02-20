# Manual Test: Pagination Control

## Prerequisites
- Run `deno task generate-default-test-bench` from the project root
- Start the server with `deno task run` and log in

## Test Data
| Path | Files | Pages at size 1000 | Pages at size 100 |
|------|-------|-------------------|-------------------|
| `testbench/long-filenames` | 20 | 1 | 1 |
| `testbench/many-files` | 17,576 | 18 | 176 |

## Steps

**Single page**

1. Navigate to `/home/?path=testbench%2Flong-filenames`  
   → `< [1] >`, both arrows disabled

**Ellipsis — near start**

2. Navigate to `/home/?path=testbench%2Fmany-files`, set page size to 1000  
   → `< [1] 2 3 ... 18 >`, `<` disabled

3. Click `>`  
   → `< 1 [2] 3 4 ... 18 >`, `<` now enabled

**Ellipsis — both sides**

4. Navigate to `/home/?path=testbench%2Fmany-files&page=9`  
   → `< 1 ... 7 8 [9] 10 11 ... 18 >`

**Ellipsis — near end**

5. Navigate to `/home/?path=testbench%2Fmany-files&page=18`  
   → `< 1 ... 16 17 [18] >`, `>` disabled

6. Click `[18]` (current page)  
   → Page unchanged, `>` remains disabled

**Large page count**

7. In Options, set page size to 100

8. Navigate to `/home/?path=testbench%2Fmany-files&page=88`  
   → `< 1 ... 86 87 [88] 89 90 ... 176 >`

9. Click `<`  
   → `< 1 ... 85 86 [87] 88 89 ... 176 >`

10. Click page `176`  
    → `< 1 ... 174 175 [176] >`, `>` disabled
