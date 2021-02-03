# frozen_string_literal: true

module TranslationsHelper
  def _t(key, args = {}, klass = '')
    "<span class='#{I18n.locale} #{klass}'>#{t key, **args}</span>".html_safe
  end

  def available_locales
    keys = %i[en ur ar bn fa fr id it nl pt sq th tr]
    locales = I18n.backend.send(:translations)

    keys.map do |key|
      [key, locales[key][:local_native_name]]
    end
  end
end
