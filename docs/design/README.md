- **Filesystem Changes** - Given a large file system that may change files without interacting with FFS, how do we predict and notify internal processes that new files (that might be of interest to process) is available for computing?

An example would be new videos or photos are uploaded, and the thumbnailer should be notified.

- **Upload Performance** - When testing the current upload algorithm (chunking + HTTP upload), it is clear that it is quite slow (barely 1MB/s). Without introducing advanced protocols like WebSocket, how can we optimize the upload speed? How can we test it?

- **Page Jittering** - The current page loading feels sluggish with a clear jittering on load. How do we best measure and minimize the jittering?

- **Home tab view mode** - The current home tab view is split into a gallery mode and a table mode. The table mode includes more actions, as there is no way to select cards in the gallery mode. How can we make the views structurally equivalent and allow selecting elements in thr gallery mode?

## Solution design - Filesystem changes

Finding filesystem changes without a purpose-built API from the OS kernel is tough. There are such APIs, e.g. fanotify, but they seem to require very high levels of user privilege. A level that is unacceptably high for FFS. 

Instead we will have to build our own cache and use directory watch systems combined with being smart in our choice of directories to watch. Combine with a "rescan everything" that runs slowly to catch any failures in the watch group.

### INotify and ReadDirectoryChangesW

INotify and ReadDirectoryChangesW are unix and Windows systems that respectively are used to notify on changes to directories.

[inotify](https://man.archlinux.org/man/inotify.7) - [ReadDirectoryChangesW](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw)

By implementing both we get a very wide coverage of notifications on a directory basis.

However, they are inadequate by themselves and have to be combined with other mechanisms to get full coverage. The inotify man page even hints at this.

With these directory watch group systems, there is another problem we need to solve. We cannot watch all directories (e.g. if there are tens of thousands we will have many useless watches). We have to limit them. And then we enter a prioritization problem. How do we prioritize the folders to watch?

#### Prioritizing folders

Use a path access log to inform which paths have been visited often. Sort with falling hits, take the top X hits and watch those. Re-balance the watch directories as the priority changes.

### Use user access pattern to inform cache updates

Whenever a user accesses a path, send a notification to listeners so they will run.

### Full directory scan

Run a directory scan every once in a while and refresh the whole cache.

### Monte Carlo scan

Run a directory scan every once in a while and refresh the cache partially, guided by prior access patterns.

### FANotify

Linux [fanotify](https://man7.org/linux/man-pages/man7/fanotify.7.html).

Pros:
- Supported since a long time ago
- Able to receive update notifications for a mount or filesystem, not just a directory

Cons:
- Watching more than a directory requires CAP_SYS_ADMIN, a permission not typically granted to "normal" users

Verdict:

Maybe good in the far future, but CAP_SYS_ADMIN is hard to argue matches the "it just works" philosophy.

## Solution design - Page jittering

The main reason for the jittering is the initial data loading. We need to find a nice way to inject data sent to the frontend already at page load. Sending the data with the initial page will make it possible to make view transitions much easier to implement, as most can be handed off to the browser, making a smooth experience.

0. Measure [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals)
1. Server side rendering for main page content (e.g. file listings)
2. View transitions for folder traversals
3. Test improved core web vitals


## Solution design - Home Tab View Mode

Proton Drive has solved this in a nice way. Selectable square in the upper corner. Lets investigate that as a possible option.
