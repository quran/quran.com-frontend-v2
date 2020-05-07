# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include PartialReplacement::Response

  before_action :set_locale

  protected

  def set_locale
    requested_locale = params[:locale] ||
      session[:locale] ||
      cookies[:locale] ||
      extract_browser_locale(request.env['HTTP_ACCEPT_LANGUAGE']) ||
      I18n.default_locale

    unless I18n.available_locales.include?(requested_locale.to_sym)
      requested_locale = I18n.default_locale
    end

    session[:locale] = requested_locale
    I18n.locale = requested_locale
  end
end
