#!/bin/bash

ZIP_NAME='./snowy@exposedcat.shell-extension.zip'

# TODO: Build schemas

rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" js schemas extension.js prefs.js stylesheet.css metadata.json