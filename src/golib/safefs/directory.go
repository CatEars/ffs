package safefs

import "os"

func DirExists(fpath string) bool {
	_, err := os.Stat(fpath)
	return err == nil
}
