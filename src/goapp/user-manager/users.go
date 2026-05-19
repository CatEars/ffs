package usermanager

import (
	"catears/ffs/goapp/config"
	"catears/ffs/lib/security"
	"catears/ffs/lib/users"
	"catears/ffs/lib/users/storage/all"
	"catears/ffs/lib/users/storage/file"
	"log"
	"os"
)

var mgr *users.UserManager = nil
var userResourceManager *security.ResourceManager = nil

func initializeManager() *users.UserManager {
	fileSource := file.NewUserFromFile(os.DirFS(".."), config.Config.UsersFile())
	manager := users.NewUserManager(fileSource)
	err := manager.Configure()
	if err != nil {
		if config.Config.DevMode() {
			log.Printf("WARN: unable to configure users from file(s), will let everyone through since we are in DEV mode: %s", err)
			letAllThrough := all.New(false)
			manager2 := users.NewUserManager(letAllThrough)
			manager2.Configure()
			return manager2
		} else {
			log.Panicf("WARN: Unable to configure users from file(s): %s", err)
		}
	}

	return manager
}

func UserManager() *users.UserManager {
	if mgr == nil {
		mgr = initializeManager()
	}
	return mgr
}

func UserResources() *security.ResourceManager {
	if userResourceManager == nil {
		userResourceManager = security.NewResourceManager("user")
	}
	return userResourceManager
}
