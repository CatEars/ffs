# FFS

Friendly File Server (FFS) is a file server borne from the ~~frustration~~ friendliness of
attempting to get other file servers to _Just Work™_.

## Run

```bash
curl -sL https://raw.githubusercontent.com/catears/ffs/master/src/deploy/auto-install/gh-deploy.sh | bash ;
docker run --rm --volume ./:/files --env 'FFS_STORE_ROOT=/files' --publish 8080:8080 catears/ffs
```

This will download the latest release and run a docker image on port 8080 for you to try it out.

Native binaries are available to download under the [Releases page](https://github.com/CatEars/ffs/releases).

## Motivation

The goals of FFS is to be:

- Crash-resistant
    - A power outage should mean you "just restart" the server
- Zero config
    - Runnable with no config and all config in-files and in-app
- Low Dependency
    - Use standard API-s and slow moving technologies instead of v0.0.1 NPM packages
- Mobile usable
    - Halfway between mobile hostile to mobile first lies mobile usable.
- Easy Extensible
    - Writing a custom plugin and enabling it should be easy peasy

## Honorable mentions - That simply did not fit me

All the different file servers I have tested have fallen short. In short, their shortcomings are
inspirations for FFS.

- NextCloud - Very big. Not very fault tolerant.
- Seafile - Dead simple installation and setup. Cool implementation with native chunking. However, an SQL databases that need manual
  migrations and downtime. In my heart, I love you Seafile, it was simply not meant to be.
- Apache file and directory indexes - Easy and little config. But I need a liiiiitle bit more than that.
- copyparty - Software that has the right _vibe_ and functions, but when I simply could not read the
  code, I felt like I was deploying a minefield of security issues.

## Licenses

See [licenses.md](./docs/licenses.md)
