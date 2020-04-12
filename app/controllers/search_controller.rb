class SearchController < ApplicationController
  include LanguageBoost

  def search
    if is_quran_text_search?
      client = Search::QuranSearchClient.new(
          query,
          page: page, size: size, lanugage: language
      )
    else
      client = Search::Client.new(
          query,
          page: page, size: size, lanugage: language
      )
    end

    search_response = client.search


    respond_to do |format|
      format.json do
        results = search_response.results
        pagination = search_response.pagination

        render json: {
            query: query,
            total_count: pagination.count,
            took: search_response.took,
            current_page: pagination.current_page,
            total_pages: pagination.total_pages,
            per_page: pagination.per_page,
            results: results
        }
      end

      format.html do
        @presenter = SearchPresenter.new(self)
        @presenter.add_search_results(search_response)
      end
    end
  end

  protected

  def is_quran_text_search?
    detected_lang = CLD.detect_language(query)

    'ar' == detected_lang[:code] && detected_lang[:reliable]
  rescue
    false
  end

  def language
    (params[:language] || params[:locale]).presence || 'en'
  end

  def query
    (params[:q] || params[:query]).to_s.strip
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
