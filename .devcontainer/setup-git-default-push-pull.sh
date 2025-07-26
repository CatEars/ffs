#!/bin/bash

if ! grep -q "refs/tags/*" ".git/config"; then
    git config --local --add remote.origin.push 'HEAD'
    git config --local --add remote.origin.push 'refs/tags/*'
    git config --local --add remote.origin.fetch '+refs/heads/*:refs/remotes/origin/*'
    git config --local --add remote.origin.fetch '+refs/tags/*:refs/tags/*'
    echo "✅ Git default push/pull mode set."
else
    echo "✅ Git default push/pull mode already set!"
fi