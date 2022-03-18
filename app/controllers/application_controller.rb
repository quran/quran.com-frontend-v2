# frozen_string_literal: true

class ApplicationController < ActionController::Base
  after_action :allow_iframe
  before_action :set_locale
  rescue_from ActionController::RoutingError, with: :not_found

  def not_found
    redirect_to '/'
  end

  def fetch_locale
    if @locale
      return @locale
    end

    requested_locale = params[:locale] ||
      session[:locale] ||
      cookies[:locale] ||
      extract_browser_locale(request.env['HTTP_ACCEPT_LANGUAGE']) ||
      I18n.default_locale

    @locale = requested_locale.to_s.strip #.split('-').first
  end

  protected

  def allow_iframe
    response.headers.except! 'X-Frame-Options'
  end

  def set_locale
    locale = fetch_locale
    locale = I18n.default_locale unless I18n.available_locales.include?(locale.to_sym)

    session[:locale] = locale
    I18n.locale = locale
  end

  def handle_routing_error
    redirect_to '/'
  end

  def cache_on_edge
    unless response.redirect?
      expires_in 30.days, public: true, must_revalidate: false
    end
  end

  # Redirect all non xhr request that has "xhr" to same path but without xhr query string
  # all xhr or full request are being cached on CF now
  # this lead to some issues, CF will return cached response of xhr requests ( that don't have layout ) to normal http request
  # now we'll distinguish b/w xhr and non xhr request using xhr query string
  def redirect_non_xhr_requests(force: false)
    if (params[:xhr] == 'true' && !request.xhr?) || force
      query_strings = params.except(:controller, :xhr, :action).permit!.to_h
      redirect_to url_for(query_strings)
    end
  end
end
