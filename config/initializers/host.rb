# frozen_string_literal: true

Rails.application.config.hosts += [
  '.quran.com',
  '.qurancdn.com',
  'localhost'
]

Rails.application.config.hosts << '.ngrok.io' if Rails.env.development?
