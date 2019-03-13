# frozen_string_literal: true

source 'https://rubygems.org'
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.1'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 6.0.0.beta1'

# Use Puma as the app server
gem 'puma', '~> 3.11'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Transpile app-like JavaScript. Read more: https://github.com/rails/webpacker
gem 'webpacker', '>= 4.0.0.rc.3'

# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# For css, we're still using Sprockets
gem 'bootstrap', '~> 4.3.1'

gem 'devise', '4.4.3'
gem 'fast_blank'
gem 'jquery-infinite-pages', github: 'naveed-ahmad/jquery-infinite-pages'
gem 'kaminari'
gem 'pagy'
gem 'pg'

gem 'jbuilder'
gem 'oj'

# i18n
gem 'translation'

# seo
gem 'canonical-rails', git: 'https://github.com/jumph4x/canonical-rails'
gem 'meta-tags'

gem 'quran-core', github: 'quran/quran-core' # path: '../quran-core'

# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use Active Model has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false
gem 'rails_script', '~> 2.0'
gem 'friendly_id', '~> 5.2.4'
gem 'friendly_id-globalize'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: %i[mri mingw x64_mingw]
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'binding_of_caller'
  gem 'pry-rails'
  gem 'web-console', '>= 3.3.0'

  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'annotate', '= 2.7.4'
  gem 'rails_real_favicon'
  gem 'rubocop', '~> 0.65.0', require: false
  gem "rubocop-rails_config"
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

group :test do
  # Adds support for Capybara system testing and selenium driver
  gem 'capybara', '>= 2.15'
  gem 'selenium-webdriver'
  # Easy installation and use of chromedriver to run system tests with Chrome
  gem 'chromedriver-helper'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
