# frozen_string_literal: true

module Search
  class Results
    def initialize(search, page, search_type=nil)
      @search = search
      @record_highlights = {}
      @result_size = 0
      @current_page = page
      @search_type = search_type

      #@search_result = search.results.results
    end

    def results
      if empty?
        {}
      else
        preppare_heighlights
        @record_highlights
      end
    end

    def pagination
      Pagy.new(count: total_count, page: @current_page + 1, per_page: VERSES_PER_PAGE)
    end

    def empty?
      @search.empty?
    end

    def timed_out?
      @search.timed_out
    end

    def took
      @search.took
    end

    protected

    def total_count
      @search.response['hits']['total']['value']
    end

    def preppare_heighlights
      @search.response['hits']['hits'].each do |hit|
        if :navigation == @search_type
          @record_highlights[hit['_source']['url']] = hit['highlight'].presence || hit['_source']['name']
        else
          @record_highlights[hit['_source']['verse_id']] = hit['highlight']
        end
        @result_size += 1
      end
    end
  end
end
