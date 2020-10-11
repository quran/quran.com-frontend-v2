# frozen_string_literal: true

class ApplicationController < ActionController::Base
  before_action :set_locale

  protected

  def set_locale
    locale = fetch_locale
    unless I18n.available_locales.include?(locale.to_sym)
      locale = I18n.default_locale
    end

    session[:locale] = locale
    I18n.locale = locale
  end

  def fetch_locale
    requested_locale = params[:locale] ||
      session[:locale] ||
      cookies[:locale] ||
      extract_browser_locale(request.env['HTTP_ACCEPT_LANGUAGE']) ||
      I18n.default_locale
  end

  def generate_localised_cache_key
    "#{controller_name}/#{action_name}/#{fetch_locale}"
  end
end
