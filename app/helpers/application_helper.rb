# frozen_string_literal: true

module ApplicationHelper
  include Pagy::Frontend

  def page_classes
    "#{controller_name} #{action_name} lang-#{I18n.locale}"
  end

  def page_id
    "#{controller_name}-#{action_name}"
  end

  def current_locale
    I18n.locale.to_s
  end

  def spinning_loader
    "<i class='fa-spinner1 animate-spin'></i> #{_t('loading')}".html_safe
  end
end
