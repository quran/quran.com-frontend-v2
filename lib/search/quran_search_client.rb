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

      if results.empty?
        Search::NavigationClient.new(query.query).search
      else
        Search::Results.new(results, page)
      end
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
      match_any = []

      query.detect_languages.each do |lang|
        if QuranSearchable::TRANSLATION_LANGUAGE_CODES.include?(lang)
          match_any << nested_translation_query(lang)
        end
      end

      match_any << quran_text_query

      {
          bool: {
              should: match_any,
              filter: filters
          }

      }
    end

    def quran_text_query
      {
          multi_match: {
              query: query.query,
              fields: QURAN_SEARCH_ATTRS
          }
      }
    end

    def nested_translation_query(language_code)
      {
          nested: {
              path: "trans_#{language_code}",
              score_mode: "max",
              query: {
                  bool: {
                      should: [
                          {
                              match: {
                                  "trans_#{language_code}.text.stemmed": query.query
                              }
                          }
                      ],
                      minimum_should_match: '85%'
                  }
              },
              inner_hits: {
                  _source: ["*.resource_name", "*.resource_id", "*.language"],
                  highlight: {
                      tags_schema: 'styled',
                      fields: {
                          "trans_#{language_code}.text.*": {
                              fragment_size: 500
                          }
                      }
                  }
              }
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
