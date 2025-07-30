#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

$THIS_SCRIPT_DIR/setup-git-aliases.sh
$THIS_SCRIPT_DIR/setup-git-default-push-pull.sh
$THIS_SCRIPT_DIR/setup-git-notes-sync.sh
$THIS_SCRIPT_DIR/setup-bash-aliases.sh
$THIS_SCRIPT_DIR/setup-ffs-dependencies.sh
$THIS_SCRIPT_DIR/setup-eruda.sh