# frozen_string_literal: true

class SearchController < ApplicationController
  include LanguageBoost
  QUERY_SANITIZER = Rails::Html::WhiteListSanitizer.new
  after_action :cache_on_edge
  before_action :redirect_non_xhr_requests

  def search
    if do_search
    else
      render 'error'
    end
  end

  def suggestion
    if do_suggest
      render layout: false
    else
      render 'suggestion_error', layout: false
    end
  end

  protected

  def language
    if (lang = (params[:language] || params[:locale])).presence
      Language.find_by_iso_code(lang)
    end
  end

  def filter_translation
    params[:translation].presence
  end

  def query
    query = (params[:q] || params[:query]).to_s.strip.first(150)
    params[:q] = query #QUERY_SANITIZER.sanitize(query)
  end

  def size(default = 20)
    (params[:size] || params[:s] || default).to_i
  end

  def page
    # NODE: ES's pagination starts from 0,
    # pagy gem we're using to render pagination start pages from 1
    (params[:page] || params[:p]).to_i.abs
  end

  def do_search
    client = Search::QuranSearchClient.new(
      query,
      page: page,
      size: size,
      language: language,
      translation: filter_translation,
      phrase_matching: force_phrase_matching?
    )
    navigational_client = Search::NavigationClient.new(
      query,
      page: page,
      size: size,
      phrase_matching: force_phrase_matching?
    )

    @presenter = SearchPresenter.new(self)

    begin
      @presenter.add_search_results(client.search)
      @presenter.add_navigational_results(navigational_client.search)

    rescue Faraday::ConnectionFailed => e
      false
    rescue Elasticsearch::Transport::Transport::ServerError => e
      # Index not ready yet? or other ES server errors
      false
    end
  end

  def do_suggest
    client = Search::QuranSearchClient.new(
      query,
      page: page,
      size: size,
      lanugage: language,
      phrase_matching: force_phrase_matching?
    )

    navigational_client = Search::NavigationClient.new(
      query,
      page: page,
      size: size,
      lanugage: language,
      phrase_matching: force_phrase_matching?
    )

    begin
      @presenter = SearchPresenter.new(self)
      @presenter.add_search_results(client.suggest)
      @presenter.add_navigational_results(navigational_client.search)

    rescue Faraday::ConnectionFailed => e
      false
    rescue Elasticsearch::Transport::Transport::ServerError => e
      # Index not ready yet? or other ES server errors
      false
    end
  end

  def action_cache_key
    "#{action_name}-#{request.xhr?}-#{params[:query]}-#{params[:page]}-#{I18n.locale}"
  end

  def force_phrase_matching?
    params[:phrase].presence || query.match?(/\d+(:)?(\d+)?/)
  end
end
