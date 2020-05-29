class SearchController < ApplicationController
  include LanguageBoost
  # caches_action :search, :suggestion, expires_in: 7.days, cache_path: :action_cache_key

  def search
    if do_search
      render partial: 'results', layout: false if request.xhr?
    else
      render 'error', layout: false if request.xhr?
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
    (params[:language] || params[:locale]).presence || 'en'
  end

  def query
    query = (params[:q] || params[:query]).to_s.strip.first(150)
    params[:q] = query
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
    @presenter = SearchPresenter.new(self)

    client = Search::QuranSearchClient.new(
      query,
      page: page, size: size, lanugage: language
    )

    begin
      results = client.search
      @presenter.add_search_results(results)
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
      page: page, size: size, lanugage: language
    )

    begin
      results = client.suggest
      @presenter = SearchPresenter.new(self)
      @presenter.add_search_results(results)
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
end
