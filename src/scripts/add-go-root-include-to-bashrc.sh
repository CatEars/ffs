#!/bin/bash

TARGET_FILE="$HOME/.set-go-root.sh"
BASHRC="$HOME/.bashrc"

if [ ! -f "$TARGET_FILE" ]; then
    echo "Creating $TARGET_FILE..."
    touch "$TARGET_FILE"
    echo "#!/bin/bash" > "$TARGET_FILE"
    echo "# Go environment configuration" >> "$TARGET_FILE"
    echo 'export GOROOT="$HOME/go"' >> "$TARGET_FILE"
fi

SOURCE_SNIPPET="if [ -f \"$TARGET_FILE\" ]; then . \"$TARGET_FILE\"; fi"

if grep -Fq "$TARGET_FILE" "$BASHRC"; then
    echo "Your .bashrc is already configured to source $TARGET_FILE."
else
    echo "Adding source command to $BASHRC..."
    echo -e "\n# Added by setup script\n$SOURCE_SNIPPET" >> "$BASHRC"
    echo "Done! Please run 'source ~/.bashrc' to update your current session."
fi