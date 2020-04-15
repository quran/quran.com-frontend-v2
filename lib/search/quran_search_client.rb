# frozen_string_literal: true

module Search
  class QuranSearchClient < Search::Client
    QURAN_SOURCE_ATTRS = ['verse_path', 'verse_id'].freeze
    QURAN_SEARCH_ATTRS = [
        "text_madani.*^4",
        "text_simple.*^3",
        "text_imlaei_simple*^3",
        "text_madani_simple.*^2",
        "verse_key.keyword",
        "verse_path",
        "chapter_names"
    ].freeze

    def initialize(query, options = {})
      super(query, options)
    end

    def search
      results = Verse.search(search_defination)

      # For debugging, copy the query and paste in kibana for debugging
      # File.open("last_query.json", "wb") do |f|
      #  f << search_defination.to_json
      # end

      if results.empty?
        Search::NavigationClient.new(query.query).search
      else
        Search::Results.new(results, page)
      end
    end

    def suggest
      results = Verse.search(search_defination(100, 10))

      if results.empty?
        Search::NavigationClient.new(query.query).search
      else
        Search::Results.new(results, page)
      end
    end

    protected

    def search_defination(highlight_size=500, result_size=VERSES_PER_PAGE)
      {
          _source: source_attributes,
          query: search_query,
          highlight: highlight(highlight_size),
          from: page * result_size,
          size: result_size
      }
    end

    def search_query(highlight_size=500)
      match_any = []

      query.detect_languages.each do |lang|
        if QuranSearchable::TRANSLATION_LANGUAGE_CODES.include?(lang)
          match_any << nested_translation_query(lang, highlight_size)
        end
      end

      match_any << quran_text_query
      match_any << words_query

      {
          bool: {
              should: match_any,
              filter: filters
          }

      }
    end

    def words_query
      [{
        nested: {
          path: 'words',
          query: {
            multi_match: {
              query: query.query.remove_dialectic,
              fields: ['words.simple']
            }
          }
        }
      },
       {
         nested: {
           path: 'words',
           query: {
             multi_match: {
               query: query.query,
               fields: ['words.madani']
             }
           }
         }
       }
      ]
    end

    def quran_text_query
      {
          multi_match: {
              query: query.query,
              fields: QURAN_SEARCH_ATTRS
          }
      }
    end

    def nested_translation_query(language_code, highlight_size)
      {
          nested: {
              path: "trans_#{language_code}",
              score_mode: "max",
              query: {
                  bool: {
                      should: [
                          {
                            "multi_match": {
                              "query": query.query,
                              "fields": ["trans_#{language_code}.text.*"]
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
                              fragment_size: highlight_size
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

    def highlight(highlight_size=500)
      {
          fields: {
              "text_madani.*": {
                  type: 'fvh',
                  fragment_size: highlight_size
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
