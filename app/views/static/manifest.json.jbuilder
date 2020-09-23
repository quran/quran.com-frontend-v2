# frozen_string_literal: true

json.short_name 'Quran.com'
json.name 'Quran.com'
json.splash_screens ['/']
json.start_url '/'
json.display 'standalone'
json.theme_color '#00acc1'
json.background_color  '#fff'

json.icons ['192x192', '256x256', ['256x256', 'maskable']] do |data|
  icon, purpose = data
  json.sizes icon
  json.type 'image/png'

  if purpose
    json.src asset_url("icons/#{icon}-#{purpose}.png")
    json.purpose purpose
  else
    json.src asset_url("icons/android-chrome-#{icon}.png")
  end
end
