package main

func Prerelease() {
	RunBash("src/scripts/build-docker.sh")
	RunBash("src/scripts/build-dist.sh")
}
