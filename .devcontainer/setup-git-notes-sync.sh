#!/bin/bash

# Automatically push and fetch notes for TODOs
if grep -q "refs/notes/*" ".git/config"; then
    git config --local --add remote.origin.push 'refs/notes/*'
    git config --local --add remote.origin.fetch '+refs/notes/*:refs/notes/*'
    echo "✅ Git notes sync set."
else
    echo "✅ Git notes seem to already be set up for sync!"
fi

