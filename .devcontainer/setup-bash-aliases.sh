#!/bin/bash

THIS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cat >> ~/.bashrc << EOL

export PATH="\$PATH:$THIS_SCRIPT_DIR/bin"
export PATH="\$PATH:$THIS_SCRIPT_DIR/../scripts/vendor/bin"

EOL
