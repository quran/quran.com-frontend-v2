# frozen_string_literal: true

module Search
  class Query
    attr_reader :query

    REGEXP = Regexp.union(%w_+ - = & | > < ! ( ) { } [ ] ^ " ~ * ?_)

    def initialize(query)
      @query = query.to_s.force_encoding('ASCII-8BIT').
          force_encoding('UTF-8').
          strip.
          gsub(/[:\/\\]+/, ':').
          gsub(REGEXP) { |m| "\\#{m}" }
    end

    def is_arabic?
      'ar' == detect_language_code
    end

    def detect_languages
      query.split(/\s/).map do |token|
        CLD.detect_language(token)[:code] rescue nil
      end.compact.uniq
    end

    def detect_language_code
      return @detect_language if @detect_language
      detected_lang = CLD.detect_language(query)
      @detect_language = detected_lang[:code]
    rescue
    end

    def query
      @query
    end

    def language_match
      @query.prose
    end
  end
end
