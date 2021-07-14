# frozen_string_literal: true

module TranslationsHelper

  def _t(key, args = {}, klass = '')
    "<span class='#{I18n.locale} #{klass}'>#{t key, **args}</span>".html_safe
  end

  def available_locales
    keys = %i[en ur ar bn ru fa fr id it nl pt sq th tr zh-CN zh-TW]
    locales = I18n.backend.send(:translations)

    keys.map do |key|
      [key, locales[key][:local_native_name]]
    end
  end

  def translation_name_filter(language_name, translated_name)
    "#{language_name.downcase} #{translated_name.to_s.downcase}".split(' ').uniq.join(' ')
  end
end
