# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '3.0.0'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.1.4.0'

# Use Puma as the app server
gem 'puma', '~> 4.3.11'

# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem 'sass-rails', '~> 6.0.0'
gem 'webpacker', '>= 5.2.2'

# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5.2.1'

gem 'fast_blank'
gem 'pg'

gem 'jbuilder', '>= 2.10.1'
gem 'oj'

# i18n
gem 'translation'

# Run any code in parallel Processes
gem 'parallel', require: false
gem 'ruby-progressbar', require: false

# seo
gem 'meta-tags', '>= 2.15.0'

# For managing cros
gem 'rack-cors', require: 'rack/cors'
gem 'sentry-raven'

# Detect language from text
gem 'cld3', '>= 3.4.1'

# Elasticsearch
# using excon as faraday adapter (net::http breaks)
gem 'elasticsearch-model', '>= 7.1.1'
gem 'excon'
gem 'typhoeus', github: 'naveed-ahmad/typhoeus'

# update the version once actionpack-action-caching is released
# https://github.com/rails/actionpack-action_caching/commit/7bdfa663274a2620dde8daad7dcb995c1cfef840
gem 'actionpack-action_caching', github: 'rails/actionpack-action_caching' # , '>= 1.2.1'
gem 'actionpack-page_caching', github: 'rails/actionpack-page_caching' # , ">= 1.2.3"

# Pagination
gem 'pagy', '= 3.7.3'

# Cache
gem 'connection_pool'
gem 'dalli'
gem 'memcachier'

gem 'sitemap_generator'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use Active Model has_secure_password
# gem 'bcrypt', '~> 3.1.7'

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'binding_of_caller'
  gem 'pry-rails'
  gem 'web-console', '>= 4.2.0'

  gem 'annotate', '>= 3.1.1'
  gem 'puma-ngrok-tunnel', '>= 1.2.0'
  # gem 'rails_real_favicon', '>= 0.1.0'
  gem 'listen'
  gem 'rubocop', '>= 1.8.1', require: false
  gem 'rubocop-performance', '>= 1.7.1'
  gem 'rubocop-rails', '~> 2.3.2'
  gem 'rubocop-rspec', '>= 1.43.2'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  # gem 'spring'
  # gem 'spring-watcher-listen', '~> 2.0.0'

  # Linters
  gem 'scss_lint'
  # Pronto specific gems will analyze code and add comments on Github PR
  # gem 'pronto'
  # gem 'pronto-blacklist', require: false
  # gem 'pronto-brakeman', require: false
  # gem 'pronto-erb_lint', '>= 0.1.5', require: false
  # gem 'pronto-fasterer', require: false
  # gem 'pronto-flay', require: false
  # gem 'pronto-rubocop', require: false
  # gem 'pronto-scss', require: false
  # if you need to run webrick server for development
  # rails server -u webrick
  gem "webrick"
  gem 'foreman'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 3.36.0'
  gem 'selenium-webdriver'
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem 'chromedriver-helper', '>= 2.1.1'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
