# User Experience

This folder describes the main problems FFS solves,
the main user roles/personas using FFS, 
which devices interact with FFS, and how FFS fulfills 
those the user needs.

## Personas

### Carl - Computer Hobbyist

Carl is adept at using computers, and likes tinkering with open source software.
He does not have that much experience with coding, but he has followed guides online
that help him download and compile software for free. He runs his own server with
some popular OSS on it, particularily related to home automation.

Carl can make basic changes if there is a guide he can follow, and he is patient
for things going a little bit wrong, as long as it turns out well in the end

### Hildegard - The Hacker

Hildegard lives and breathes computers. She works as a DevOps engineer, writing and
running advanced software services. In her spare time she tinkers with niche OSes for her home servers and raspberry pies. She rents a few VPSes and occasionally test network-related open source software to connect her different managed servers.

Given enough time, she can solve any coding challenge in front of her. However, when using OSS, she is very concious of the security and resource impact. Javascript on her servers is strictly forbidden. When using other peoples software she has a very low tolerance for things not working.

### Winston - Windows Normie

Winston only occasionally uses a computer, he prefers his smartphone and tablet. But he does own a windows desktop computer that he occasionally use for playing games. He gets tech information and news from his group of friends over Discord. He knows how to install and run well packaged programs, for e,ample if they can be installed via a platform like Steam or Microsoft App Store. He finds GitHub, READMEs and editing JSON files confusing.

When installing and using software he has neither the skills nor interest to troubleshoot issues. If there is no intuitive user interface, he will uninstall the program.

## Problems

### Browse server files

Roles: Carl, Hildegard, Winston

As a computer user, I want a nice, clean, and quick UI to browse and inspect files when on the same network so that I can browse files from another device.

I want to be able to quickly find, view, and download all types of files, including photos and videos.

As a basic user I don't want to be overwhelmed with technical jargon I do not understand.

As an advanced user I want more detailed information per file (e.g. permission bits)

#### Finding information

As a user, I want to be able to search for files and find them both via their names, and reasonably indexed metadata.

When searching for visual media, I want to see previews of their contents as thumbnails.

### Install FFS

Roles: Carl, Hildegard, Winston

As a computer user intending to install FFS, I want the installation to be smooth.

As a novice user, I want the initial installation packaging to work without any instructions.

As an intermediate user, I want the installation effort to have a clear guide that works.

As an advanced user, I want to get the final configuration quickly and working easy with my existing tools. I want to know any potential risks of the software I am installing.

### Manage files

"Manage" in this context means moving, deleting, renaming, uploading, ...

Roles: Carl, Hildegard, Winston

As a computer user I want to interact with the file server similar to how I would use File Explorer software to explore a desktops local files. I want to be able to move files, rename them, delete them, upload new files, copy files.

## Devices

These are the devices the different personas will interact with FFS from:

- Linux desktop / Firefox, Terminal Emulator
- Windows desktop / Edge, Terminal Emulator
- MacOS desktop / Safari
- Android smartphone / Chrome for Android
- Android tablet / Chrome for Android
- iPhone / Safari
- iPad / Safari

## Main flows

...


