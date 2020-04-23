#!/bin/bash

# exit on error
set -e

# generate sitemap
bundle exec rake sitemap:refresh:no_ping
cp public/sitemaps/sitemap.xml.gz public/sitemap.xml.gz
