# frozen_string_literal: true

module Search
  class NavigationClient < Search::QuranSearchClient
    SOURCE_ATTRS = %w[raw url type id].freeze
    RESULT_SIZE = 5

    def initialize(query, options = {})
      super(query, options)
    end

    def search
      search = Elasticsearch::Model.search(search_definition, [Chapter, Juz, MuhsafPage])

      # For debugging, copy the query and paste in kibana for debugging
      #File.open("last_navigational_query.json", "wb") do |f|
      #f << search_definition.to_json
      #end

      Search::Results.new(search, page, :navigation)
    end

    protected

    def search_definition
      {
        _source: source_attributes,
        query: search_query,
        highlight: highlight,
        from: page * RESULT_SIZE,
        size: RESULT_SIZE
      }
    end

    def search_query
      {
        bool: {
          should: navigational_query
        }
      }
    end

    def navigational_query
      [
        multi_match_query(fields: [
          "text.autocomplete",
          "text.autocomplete._2gram",
          "text.autocomplete._3gram"
        ]),
        simple_match_query(fields: ["text.autocomplete"]),
        match_phrase_prefix_query(fields: "text.autocomplete")
      ]
    end

    def source_attributes
      SOURCE_ATTRS
    end

    def highlight
      {
        fields: {
          raw: {
            type: 'fvh'
          },
          "text.autocomplete": {
          }
        },
        tags_schema: 'styled'
      }
    end
  end
end
