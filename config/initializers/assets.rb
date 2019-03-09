# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
# Add Yarn node_modules folder to the asset load path.
Rails.application.config.assets.paths << Rails.root.join('node_modules')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )

Rails.application.config.assets.paths << Rails.root.join('app', 'assets', 'fonts')

Rails.application.config.assets.precompile += %w[svg eot woff ttf woff2 otf]
Rails.application.config.assets.paths << Pagy.root.join('javascripts')

if Rails.env.production? || Rails.env.staging?
  Rails.application.config.assets.initialize_on_precompile = true
  Rails.application.config.static_cache_control = 'public, max-age=31536000'
end
