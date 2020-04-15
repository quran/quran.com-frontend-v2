require 'elasticsearch/model'

module QuranSearchable
  TRANSLATION_LANGUAGES = Language.where(id: Translation.select('DISTINCT(language_id)').map(&:language_id).uniq)
  TRANSLATION_LANGUAGE_CODES = TRANSLATION_LANGUAGES.pluck(:iso_code)

  extend ActiveSupport::Concern

  included do
    include Elasticsearch::Model
    ES_TEXT_SANITIZER = Rails::Html::WhiteListSanitizer.new

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

      translations.includes(:language).each do |trans|
        doc = {
          translation_id: trans.id,
          text: ES_TEXT_SANITIZER.sanitize(trans.text, tags: %w(), attributes: []),
          language: trans.language_name,
          resource_id: trans.resource_content_id,
          resource_name: trans.resource_name
        }

        hash["trans_#{trans.language.iso_code}"] ||= []
        hash["trans_#{trans.language.iso_code}"] << doc
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
        indexes text_type, type: "text" do
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

          indexes :autocomplete,
                  type: 'completion',
                  analyzer: 'arabic_synonym_normalized',
                  search_analyzer: 'arabic_synonym_normalized'
        end
      end

      indexes 'words', type: 'nested', include_in_parent: true, dynamic: false do
        indexes :madani,
                type: 'text',
                term_vector: 'with_positions_offsets',
                analyzer: 'arabic_synonym_normalized',
                similarity: 'my_bm25',
                search_analyzer: 'arabic_stemmed' do
          indexes :autocomplete,
                  type: 'completion',
                  analyzer: 'arabic_synonym_normalized',
                  search_analyzer: 'arabic_synonym_normalized'
        end

        indexes :simple,
                type: 'text',
                term_vector: 'with_positions_offsets',
                analyzer: 'arabic_synonym_normalized',
                similarity: 'my_bm25',
                search_analyzer: 'arabic_synonym_normalized'
      end

      TRANSLATION_LANGUAGES.each do |lang|
        es_analyzer = lang.es_analyzer_default.present? ? lang.es_analyzer_default : nil

        indexes "trans_#{lang.iso_code}", type: 'nested' do
          indexes :text, type: 'text' do
            indexes :text,
                    type: 'text',
                    similarity: 'my_bm25',
                    term_vector: 'with_positions_offsets',
                    analyzer: es_analyzer || 'standard',
                    search_analyzer: es_analyzer || 'standard'

            indexes :stemmed,
                    type: 'text',
                    similarity: 'my_bm25',
                    term_vector: 'with_positions_offsets_payloads',
                    analyzer: es_analyzer || 'english',
                    search_analyzer: es_analyzer || 'english'

            indexes :autocomplete,
                    type: 'completion',
                    search_analyzer: 'standard',
                    analyzer: es_analyzer || 'english'
          end
        end
      end
    end
  end
end
