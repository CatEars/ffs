package main

import (
	"fmt"
	"os"
	"os/signal"

	"golang.org/x/sys/unix"
)

func main() {

	if len(os.Args) < 2 {
		fmt.Println("Buddy, you gotta give me a directory man")
		os.Exit(-1)
	}
	target := os.Args[1]

	fmt.Printf("Looking at %s\n", target)

	flags := uint(unix.FAN_CLOEXEC | unix.FAN_CLASS_NOTIF)
	fflags := uint(unix.O_RDONLY | unix.O_LARGEFILE)
	fd, err := unix.FanotifyInit(flags, fflags)
	if err != nil {
		fmt.Printf("Woops, got error %s from FanotifyInit!", err.Error())
		os.Exit(-1)
	}
	defer unix.Close(fd)

	flags = unix.FAN_MARK_ADD
	mask := uint64(0) | unix.FAN_CLOSE | unix.FAN_MOVE | unix.FAN_ONDIR
	err = unix.FanotifyMark(fd, flags, mask, unix.AT_FDCWD, target)
	if err != nil {
		fmt.Printf("Error when marking fanotify %s\n", err.Error())
		os.Exit(-1)
	}

	for {
		buff := make([]byte, 4096)
		n, err := unix.Read(fd, buff)
		if err != nil {
			fmt.Printf("Error when reading from fanotify %s\n", err.Error())
			os.Exit(-1)
		}
		fmt.Printf("Read %d bytes\n", n)
		
	}
}
