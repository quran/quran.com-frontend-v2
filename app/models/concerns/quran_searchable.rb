require 'elasticsearch/model'

module QuranSearchable
  extend ActiveSupport::Concern

  included do
    include Elasticsearch::Model

    settings YAML.load(
        File.read("config/elasticsearch/settings.yml")
    )

    alias_method :verse_id, :id

    def verse_path
      "#{chapter_id}/#{verse_number}"
    end

    def as_indexed_json(options = {})
      hash = self.as_json(
          only: [:id, :verse_key, :text_madani, :text_imlaei, :chapter_id],
          methods: [:verse_path, :verse_id]
      )

      hash[:text_madani_simple] = text_madani.remove_dialectic
      hash[:text_imlaei_simple] = text_imlaei.remove_dialectic

      hash[:words] = words.where.not(text_madani: nil).map do |w|
        {id: w.id, madani: w.text_madani, simple: w.text_simple}
      end

      hash
    end

    mappings dynamic: 'false' do
      indexes :verse_path, type: 'keyword' # allow user to search by path e.g 1/2, 2/29 etc
      indexes :chapter_id, type: 'integer' # Used for filters, when user want to search from specific surah
      indexes :verse_id, type: 'integer' # For loading record from db. We're not using ES's records method. All indexes will have this field
      indexes :verse_key, type: 'text' do
        indexes :keyword, type: 'keyword'
      end

      [:text_madani_simple, :text_imlaei_simple, :text_madani].each do |text_type|
        indexes text_type, type: 'text' do
          indexes :text,
                  type: 'text',
                  similarity: 'my_bm25',
                  term_vector: 'with_positions_offsets_payloads',
                  analyzer: 'arabic_normalized',
                  search_analyzer: 'arabic_normalized'

          indexes :analyzed,
                  type: 'text',
                  term_vector: 'with_positions_offsets',
                  analyzer: 'arabic_synonym_normalized',
                  similarity: 'my_bm25',
                  search_analyzer: 'arabic_synonym_normalized'

          indexes :stemmed,
                  type: 'text',
                  similarity: 'my_bm25',
                  term_vector: 'with_positions_offsets',
                  search_analyzer: 'arabic_stemmed',
                  analyzer: 'arabic_ngram'
          #indexes :autocomplete,
          #        type: 'string',
          #        analyzer: 'autocomplete_arabic',
          #        search_analyzer: 'arabic_normalized',
          #        index_options: 'offsets'
        end
      end

      indexes 'words', type: 'nested', include_in_parent: true, dynamic: false do
        indexes :madani,
                type: 'text',
                term_vector: 'with_positions_offsets',
                analyzer: 'arabic_synonym_normalized',
                similarity: 'my_bm25',
                search_analyzer: 'arabic_stemmed'

        indexes :simple,
                type: 'text',
                term_vector: 'with_positions_offsets',
                analyzer: 'arabic_synonym_normalized',
                similarity: 'my_bm25',
                search_analyzer: 'arabic_synonym_normalized'
      end

      #languages = Translation.where(resource_type: 'Verse').pluck(:language_id).uniq
      #available_languages = Language.where(id: languages)

      false && available_languages.each do |lang|
        es_analyzer = lang.es_analyzer_default.present? ? lang.es_analyzer_default : nil

        indexes "trans_#{lang.iso_code}", type: 'nested' do
          indexes :text,
                  type: 'text',
                  similarity: 'my_bm25',
                  term_vector: 'with_positions_offsets',
                  analyzer: es_analyzer || 'standard'
          indexes :stemmed,
                  type: 'text',
                  similarity: 'my_bm25',
                  term_vector: 'with_positions_offsets_payloads',
                  analyzer: es_analyzer || 'english'
        end
      end
    end
  end
end
