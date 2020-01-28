# frozen_string_literal: true

json.short_name 'Quran.com'
json.name 'Quran.com'
json.splash_screens ['/']
json.start_url '/'
json.display 'standalone'
json.theme_color '#00acc1'
json.background_color  '#fff'

json.icons ['192x192', '256x256'] do |icon|
  json.src asset_pack_url "media/images/icons/android-chrome-#{icon}.png"
  json.sizes icon
  json.type 'image/png'
end
