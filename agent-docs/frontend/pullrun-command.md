# Pullrun Command

## Overview
The `pullrun` command is a devcontainer utility that combines automatic git pulls with running the development server.

## Usage
```bash
pullrun
```

## Features

### Auto-Pull
- Automatically runs `git pull --rebase --autostash` every 30 seconds in the background
- Allows developers to receive updates from remote without manual intervention
- Uses rebase to maintain a clean commit history
- Autostashes local changes to avoid conflicts

### Auto-Restart on Failure
- Runs `deno task run` to start the development server
- If the application crashes (non-zero exit code), automatically restarts after 3 seconds
- If the application exits cleanly (exit code 0), the command terminates
- Useful for rapid development where code changes might temporarily break the application

### Clean Termination
- Press `Ctrl+C` to cleanly terminate both the auto-pull loop and the development server
- The script properly cleans up background processes on exit

## Implementation
The script is located at `.devcontainer/bin/pullrun` and is automatically added to the PATH during devcontainer setup.
