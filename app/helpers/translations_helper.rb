# frozen_string_literal: true

module TranslationsHelper
  def _t(key)
    "<span class='#{I18n.locale}'>#{t key}</span>".html_safe
  end

  def available_locales
    locales = I18n.backend.send(:translations)

    locales.keys.map do |key|
      [key, locales[key][:local_native_name]]
    end
  end
end
