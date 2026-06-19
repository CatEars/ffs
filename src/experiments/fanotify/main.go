package main

import (
	"encoding/binary"
	"fmt"
	"os"

	"golang.org/x/sys/unix"
)

func fanotify() {

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

type INotifyEvent struct {
	Wd     int32
	Mask   uint32
	Cookie uint32
	Len    uint32
	Name   string
}

func inotify() {

	if len(os.Args) < 2 {
		fmt.Println("Buddy, you gotta give me a directory man")
		os.Exit(-1)
	}
	target := os.Args[1]

	fmt.Printf("Looking at %s\n", target)

	fd, err := unix.InotifyInit1(unix.IN_CLOEXEC)
	if err != nil {
		fmt.Printf("Woops, got error %s from InotifyInit!", err.Error())
		os.Exit(-1)
	}
	defer unix.Close(fd)

	mask := uint32(unix.IN_CLOSE_WRITE | unix.IN_DELETE)
	_, err = unix.InotifyAddWatch(fd, target, mask)
	if err != nil {
		fmt.Printf("Error when marking inotify %s\n", err.Error())
		os.Exit(-1)
	}

	buff := make([]byte, 4096)
	for {
		n, err := unix.Read(fd, buff)
		if err != nil {
			fmt.Printf("Error when reading from inotify %s\n", err.Error())
			os.Exit(-1)
		}
		fmt.Printf("Read %d bytes\n", n)
		evts := []INotifyEvent{}
		for idx := 0; idx < n; {
			evt := INotifyEvent{}
			evt.Wd = int32(binary.NativeEndian.Uint32(buff[idx : idx+4]))
			idx += 4
			evt.Mask = binary.NativeEndian.Uint32(buff[idx : idx+4])
			idx += 4
			evt.Cookie = binary.NativeEndian.Uint32(buff[idx : idx+4])
			idx += 4
			evt.Len = binary.NativeEndian.Uint32(buff[idx : idx+4])
			idx += 4
			evt.Name = string(buff[idx : idx+int(evt.Len)])
			idx += int(evt.Len)
			evts = append(evts, evt)
			if (evt.Mask & unix.IN_CLOSE_WRITE) > 0 {
				fmt.Printf("File %s updated\n", evt.Name)
			} else if (evt.Mask & unix.IN_DELETE) > 0 {
				fmt.Printf("File %s deleted\n", evt.Name)
			}
		}
	}
}

func main() {
	inotify()
}
