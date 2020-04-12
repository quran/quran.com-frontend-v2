# frozen_string_literal: true

module Search
  class QuranSearchClient < Search::Client
    QURAN_SOURCE_ATTRS = ['verse_path', 'verse_id'].freeze
    QURAN_SEARCH_ATTRS = [
        "text_madani.*^4",
        "text_imlaei_simple*^3",
        "text_madani_simple.*^2",
        "words.text_simple^2",
        "verse_key.keyword",
        "verse_path",
        "chapter_names"
    ].freeze

    def initialize(query, options = {})
      super(query, options)
    end

    def search
      results = Verse.search(search_defination)
      Search::Results.new(results, page)
    end

    protected

    def search_defination
      {
          _source: source_attributes,
          query: search_query,
          highlight: highlight,
          from: page * VERSES_PER_PAGE,
          size: VERSES_PER_PAGE
      }
    end

    def search_query
      {
          bool: {
              should: quran_text_query,
              filter: filters
          }

      }
    end

    def quran_text_query
      {
          multi_match: {
              query: query.query.remove_dialectic,
              fields: QURAN_SEARCH_ATTRS
          }
      }
    end

    def source_attributes
      QURAN_SOURCE_ATTRS
    end

    def highlight
      {
          fields: {
              "text_madani.text": {
                  type: 'fvh',
                  fragment_size: 500
              },
              chapter_names: {},
              'verse_key.keyword': {},
              'verse_path': {}
          },
          tags_schema: 'styled'
      }
    end

    def filters
      query_filters = {}

      if filter_chapter?
        query_filters[:match_phrase] = {chapter_id: options[:chapter].to_i}
      end

      [query_filters.presence].compact
    end

    def filter_chapter?
      options[:chapter].presence && options[:chapter].to_i > 0
    end
  end
end
