#!/bin/bash

echo "Checking Kernel..."

version="$(uname)"

if [ $version == "Darwin" ]; then
	echo "MacOS detected. Continuing..."
	cd build
	echo "🛠  Running iconutil..."
	iconutil -c icns icon.iconset
	echo "Icon built."
	cd ..
	echo "Done."
else
	echo "🛑 OS is NOT MacOS. Aborting..."
fi
