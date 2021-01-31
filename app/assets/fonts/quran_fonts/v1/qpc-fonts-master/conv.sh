#!/bin/bash

mkdir "$1-woff"
for file in $1/*; do
    bn=${file##*/}
    ./ttf2woff-1.2/ttf2woff "$file" "$1-woff/${bn%.*}.woff"
done

mkdir "$1-woff2"
for file in $1/*; do
    ./woff2/woff2_compress "$file"
done
mv "$1/"*.woff2 "$1-woff2/"
