#!/bin/bash

apt-get update
apt install make g++ zlib1g-dev 

# woff2
git clone --recursive https://github.com/google/woff2.git
cd woff2
make clean all

# tt2woff
wget http://wizard.ae.krakow.pl/~jb/ttf2woff/ttf2woff-1.2.tar.gz
tar -xf ttf2woff-1.2.tar 
cd ttf2woff-1.2/
make
