class SearchController < ApplicationController
  include LanguageBoost

  def search
    client = Search::QuranSearchClient.new(
        query,
        page: page, size: size, lanugage: language
    )

    @presenter = SearchPresenter.new(self)
    @presenter.add_search_results(client.search)

    render partial: 'results', layout: false if request.xhr?
  end

  def suggestion
    client = Search::QuranSearchClient.new(
      query,
      page: page, size: size, lanugage: language
    )

    @presenter = SearchPresenter.new(self)
    @presenter.add_search_results(client.suggest)

   render layout: false
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
end
