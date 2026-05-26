package cache

import (
	"catears/ffs/goapp/config"
	"catears/ffs/lib/autofolder"
)

var CacheRootFolder autofolder.AutoFolder = autofolder.NewSentinel()
var DiskUsageCacheFolder autofolder.AutoFolder = autofolder.NewSentinel()
var DownloadManifestsFolder autofolder.AutoFolder = autofolder.NewSentinel()
var EphemeralUsersFolder autofolder.AutoFolder = autofolder.NewSentinel()
var ShareManifestsFolder autofolder.AutoFolder = autofolder.NewSentinel()
var ThumbnailsFolder autofolder.AutoFolder = autofolder.NewSentinel()
var ThumbnailsTempFolder autofolder.AutoFolder = autofolder.NewSentinel()
var UploadFolder autofolder.AutoFolder = autofolder.NewSentinel()

func InitializeCacheFolders() {
	CacheRootFolder = autofolder.New(config.Config.CacheRoot(), autofolder.GroupAccess)
	DiskUsageCacheFolder = CacheRootFolder.Sub("disk-usage")
	DownloadManifestsFolder = CacheRootFolder.Sub("download-manifests")
	EphemeralUsersFolder = CacheRootFolder.Sub("ephemeral-users")
	ShareManifestsFolder = CacheRootFolder.Sub("share-manifests")
	ThumbnailsFolder = CacheRootFolder.Sub("thumbnails")
	ThumbnailsTempFolder = CacheRootFolder.Sub("thumbnail-tmp")
	UploadFolder = CacheRootFolder.Sub("upload")
}
