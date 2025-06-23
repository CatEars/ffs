# FFS

Friendly File Server (FFS) is a file server borne from the ~~frustration~~ friendliness of attempting to get other file servers to work.

The goals of FFS is to be:

-   Crash-resistant
    -   A power outage should mean you "just restart" the server
-   Zero config
    -   Runnable with no config and all config in-files and in-app
-   Low Dependency
    -   Use standard API-s and slow moving technologies instead of v0.0.1 NPM packages
-   Mobile usable
    -   Halfway between mobile hostile to mobile first lies mobile usable.
-   Easy Extensible
    -   Writing a custom plugin and enabling it should be easy peasy

## Honorable mentions - That simply did not fit me

All the different file servers I have tested have fallen short. In short, their shortcomings are inspirations for FFS.

-   NextCloud - SQL Database and complicated upgrades. Clearly built for organizations that can pour lots of effort into just getting it running...
-   Seafile - Dead simple installation and setup. However, an SQL databases that need manual migrations and downtime. In my heart, I love you Seafile, it was simply not meant to be.
-   Apache file and directory indexes - Easy and little config. But not much else than that.
-   copyparty - Software that had the right _vibe_ and functions, but when I simply could not read the code, I felt like I was deploying a minefield of security issues.

## Licenses

### Material Design Icons License

Material design icons are stored as part of this repository.

See [License](https://raw.githubusercontent.com/google/material-design-icons/refs/heads/master/LICENSE) and [fonts.google.com](https://fonts.google.com)
for more info

### Image Magick License

Copyright 2025 Henrik "CatEars" Adolfsson

Licensed under the ImageMagick License (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy
of the License at

https://imagemagick.org/script/license.php

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.
