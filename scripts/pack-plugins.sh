
#!/bin/bash

# Absolute or relative path to plugins directory
PLUGIN_DIR="src/website/views/plugins"
DIST_DIR="dist"

# Ensure the plugins directory exists
if [ ! -d "$PLUGIN_DIR" ]; then
  echo "Directory '$PLUGIN_DIR' does not exist."
  exit 1
fi

# Create the dist directory if it doesn't exist
mkdir -p "$DIST_DIR"

# Loop through each subdirectory in the plugins directory
for item in "$PLUGIN_DIR"/*; do
  if [ -d "$item" ]; then
    folder_name=$(basename "$item")

    # Change into the plugins directory to zip relative paths only
    (
      cd "$PLUGIN_DIR" || exit
      zip -r "../../../../$DIST_DIR/${folder_name}.zip" "$folder_name"
    )
  fi
done

echo "Zipping complete. Output saved to '$DIST_DIR'."
