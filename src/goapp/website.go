package main

import "embed"

//go:embed website/*
var WebsiteContent embed.FS
