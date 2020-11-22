# frozen_string_literal: true

TranslationIO.configure do |config|
  config.api_key        = Rails.application.credentials[:translation_key]
  config.source_locale  = 'en'
  config.target_locales = ['sq', 'am-ET', 'ar', 'az', 'bn-BD', 'zh-CN', 'dv', 'nl', 'fr', 'de', 'ha-Latn-NG', 'he', 'hi', 'id', 'it', 'ja', 'ks', 'ko', 'ms', 'ne-NP', 'ps-AF', 'fa', 'pt-BR', 'ru', 'sd', 'si-LK', 'so', 'es', 'ta', 'te', 'te-IN', 'th', 'tr', 'ug-CN', 'ur', 'yo-NG']

  # Uncomment this if you don't want to use gettext
  config.disable_gettext = true

  # Uncomment this if you already use gettext or fast_gettext
  # config.locales_path = File.join('path', 'to', 'gettext_locale')

  # Find other useful usage information here:
  # https://github.com/translation/rails#readme
  #
  # Project
  # https://translation.io/quran/quran
  config.ignored_key_prefixes = [
    'errors.messages',
    'activerecord',
    'date',
    'datetime',
    'number',
    'time',
    'helpers'
  ]
end

I18n::Backend::Simple.send(:include, I18n::Backend::Fallbacks)
