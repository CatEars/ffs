#!/bin/bash

# Automatically push and fetch notes for TODOs
git config --local --add remote.origin.push 'refs/notes/*'
git config --local --add remote.origin.fetch '+refs/notes/*:refs/notes/*'

echo "✅ Git notes sync set."
