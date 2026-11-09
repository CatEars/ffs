package main

func Release() {
	Fatal(RunBash("src/scripts/ensure-tag-on-current-commit.sh"))
	Fatal(RunBash("src/scripts/build-docker.sh"))
	Fatal(RunBash("src/scripts/build-dist.sh"))
	Fatal(RunBash("src/scripts/create-github-release.sh"))
}
