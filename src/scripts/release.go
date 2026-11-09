package main

func Release() {
	Fatal(RunBash("src/scripts/ensure-tag-on-current-commit.sh"))
	Fatal(RunBash("src/scripts/create-release-candidate.sh"))
	Fatal(RunBash("src/scripts/create-github-release.sh"))
}
