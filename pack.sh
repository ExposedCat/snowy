#!/bin/bash

ZIP_NAME='./snowy@exposedcat.shell-extension.zip'

rm -f "$ZIP_NAME" ./schemas/gschemas.compiled

glib-compile-schemas ./schemas

zip -r "$ZIP_NAME" js schemas extension.js prefs.js stylesheet.css metadata.json