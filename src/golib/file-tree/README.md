# File Tree

The main abstraction for searching and locating files on disk.

## Plain

A plain file tree starts with a root file and models all directories and files under it. The implementation ensures you never leave the root of the file tree, making directory traversal attacks impossible.

It can be configured to follow symlinks, or ignore them. Symlinks are represented as if they were part of the file tree.

### Operations

```go
/**
 * Resolves a path inside the tree. Paths that would traverse 
 * outside the file tree returns `Invalid`
 *
 * FileTree("/").Traverse("etc/../passwd") resolves to `/etc/passwd`
 * FileTree("/tmp").Traverse("../etc/passwd") resolve to Invalid
 * FileTree("/").Traverse("does-not-exist") resolves to `/doesn-not-exist` (and can then be tested for existance)
 * FileTree("/tmp").Traverse("/etc/passwd") resolves to `/tmp/etc/passwd`
 */
Traverse(path string) *FileTree

/*
 * Apply a function to a file. Similar pattern for directory and file tree
 *
 * If the file tree is Invalid or does not point to a file, the file operation os not called.
 */
WalkFile(ft *FileTree, fo *FileOperation)

WalkDir(ft *FileTree, do *DirectoryOperation)

WalkTree(ft *FileTree, to *TreeOperation)
```

## Virtual

A virtual file tree acts like a plain file tree, but is contained fully within memory.
