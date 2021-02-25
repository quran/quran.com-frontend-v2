# frozen_string_literal: true

class VerseFinder
  attr_reader :params,
              :results,
              :next_page,
              :total_records

  def initialize(params)
    @params = params
  end

  def random_verse(filters, language_code, words: true, translations: false, audio: false)
    @results = Verse.unscope(:order).where(filters).order('RANDOM()').limit(3)

    load_translations(translations) if translations.present?
    load_words(language_code) if words
    load_audio(audio) if audio

    words_ordering = words ? ', words.position ASC, word_translations.priority ASC' : ''
    @results.order("verses.verse_index ASC #{words_ordering}".strip).sample
  end

  def find_by_key(key, language_code, words: true, tafsirs: false, translations: false, audio: false)
    @results = Verse.where(verse_key: key).limit(1)

    load_translations(translations) if translations.present?
    load_words(language_code) if words
    load_audio(audio) if audio
    load_tafsirs(tafsirs) if tafsirs.present?

    words_ordering = words ? ', words.position ASC, word_translations.priority ASC' : ''
    @results.order("verses.verse_index ASC #{words_ordering}".strip).first
  end

  def load_verses(filter:, language:, words: true, translations: false)
    fetch_verses_range(filter)
    load_translations(translations) if translations.present?
    load_words(language) if words

    words_ordering = words ? ', words.position ASC, word_translations.priority ASC' : ''
    @results.order("verses.verse_index ASC #{words_ordering}".strip)
  end

  def fetch_verses_range(filter)
    @results = send("fetch_by_#{filter}")
  end

  def per_page
    limit = (params[:per_page] || 10).to_i.abs
    limit <= 50 ? limit : 50
  end

  def total_pages
    (total_records / per_page.to_f).ceil
  end

  def current_page
    @current_page ||= (params[:page].to_i <= 1 ? 1 : params[:page].to_i)
  end

  protected

  def fetch_by_chapter
    if chapter = Chapter.find_by(id: params[:chapter_number].to_i.abs)
      @total_records = chapter.verses_count
      verse_start = verse_pagination_start(@total_records)
      verse_end = verse_pagination_end(verse_start, @total_records)

      @next_page = current_page + 1 if verse_end < params[:to]

      @results = Verse
                     .where(chapter_id: params[:chapter_number].to_i.abs)
                     .where('verses.verse_number >= ? AND verses.verse_number <= ?', verse_start.to_i, verse_end.to_i)
    else
      @results = Verse.where('1=0')
    end

    @results
  end

  def fetch_by_page
    @results = Verse.where(page_number: params[:page_number].to_i.abs)
    # No pagination in page mode
    @next_page = nil
    @total_records = @results.size

    @results
  end

  def fetch_by_rub
    results = rescope_verses('verse_index')
                  .where(rub_number: params[:rub_number].to_i.abs)

    @total_records = results.size
    @results = results.limit(per_page).offset((current_page - 1) * per_page)

    if current_page < total_pages
      @next_page = current_page + 1
    end

    @results
  end

  def fetch_by_hizb
    results = rescope_verses('verse_index')
                  .where(hizb_number: params[:hizb_number].to_i.abs)

    @total_records = results.size
    @results = results.limit(per_page).offset((current_page - 1) * per_page)

    if current_page < total_pages
      @next_page = current_page + 1
    end

    @results
  end

  def fetch_by_juz
    if juz = Juz.find_by(juz_number: params[:juz_number].to_i.abs)
      @total_records = juz.verses_count

      if params[:reading]
        # Reading mode will not use page, but start from last shown verse
        # and load full page
        last_verse = nil

        if params[:after]
          last_verse = Verse.where(juz_number: juz.id, id: params[:after]).first
        end

        last_verse ||= Verse.find(juz.first_verse_id)

        @results = rescope_verses('verse_index')
                       .where(juz_number: juz.juz_number, page_number: last_verse.page_number)

        if @results.last.id < juz.last_verse_id
          @next_page = current_page + 1
        end

        @results
      else
        verse_start = juz.first_verse_id + (current_page - 1) * per_page
        verse_end = min(verse_start + per_page, juz.last_verse_id)

        if verse_end < juz.last_verse_id
          @next_page = current_page + 1
        end

        @results = rescope_verses('verse_index')
                       .where(juz_number: juz.juz_number)
                       .where('verses.verse_index >= ? AND verses.verse_index < ?', verse_start.to_i, verse_end.to_i)
      end
    else
      Verse.where('1=0')
    end
  end

  def verse_pagination_start(total_verses)
    if (from = (params[:from] || 1).to_i.abs).zero?
      from = 1
    end

    start = from + (current_page - 1) * per_page

    min(start, total_verses)
  end

  def verse_pagination_end(start, total_verses)
    to = params[:to].presence ? params[:to].to_i.abs : nil
    verse_to = min(to || total_verses, total_verses)
    params[:to] = verse_to

    min((start + per_page), verse_to)
  end

  def load_words(word_trans_language)
    words_with_default_translation = @results.where(word_translations: {language_id: Language.default.id})

    if word_trans_language
      @results = @results
                     .where(word_translations: {language_id: word_trans_language.id})
                     .or(words_with_default_translation)
                     .eager_load(words: eager_load_words)
    else
      @results = words_with_default_translation.eager_load(words: eager_load_words)
    end
  end

  def load_translations(translations)
    @results = @results
                   .where(translations: {resource_content_id: translations})
                   .eager_load(:translations)
  end

  def rescope_verses(by)
    Verse.unscope(:order).order("#{by} ASC")
  end

  def eager_load_words
    %i[
      word_translation
    ]
  end

  def min(a, b)
    a < b ? a : b
  end
end
