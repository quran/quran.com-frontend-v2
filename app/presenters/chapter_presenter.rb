# frozen_string_literal: true

class ChapterPresenter < HomePresenter
  WORD_TEXT_TYPES = ['code', 'code_v2', 'text_indopak', 'uthmani', 'text_imlaei', 'text_madani'].freeze

  FONT_METHODS = {
    'v1' => 'code',
    'v2' => 'code_v2',
    'uthmani' => 'text_madani',
    'imlaei' => 'text_imlaei',
    'indopak' => 'text_indopak',
    'tajweed' => 'text_uthmani_tajweed',
  }.freeze

  def initialize(context)
    super context

    @range_start, @range_end = params[:range].to_s.split('-')
  end

  def chapter
    @chapter ||= Chapter.find_using_slug(params[:id])
  end

  def reading_mode?
    return @reading_mode unless @reading_mode.nil?

    reading = params[:reading] || session[:reading]
    session[:reading] = reading.to_s == 'true'
    @reading_mode = session[:reading]
  end

  def font
    strong_memoize :font do
      _font = params[:font].presence || session[:font] || 'v1'
      _font = FONT_METHODS.key?(_font) ? _font : 'v1'
      session[:font] = _font
    end
  end

  def font_method
    return @font_method if @font_method

    @font_method = FONT_METHODS[font].presence || 'code'
  end

  def render_verse_words?
    WORD_TEXT_TYPES.include?(font_method)
  end

  def paginate
    @verses ||= verses(verse_pagination_start, per_page)
  end

  def all
    verses(verse_pagination_start, range_end - range_start)
  end

  def per_page
    10.0
  end

  # Next page number in the collection
  def next_page
    current_page + 1 unless last_page? || out_of_range?
  end

  def first_page
    1
  end

  # Previous page number in the collection
  def prev_page
    current_page - 1 unless first_page? || out_of_range?
  end

  # First page of the collection?
  def first_page?
    current_page == 1
  end

  # Last page of the collection?
  def last_page?
    current_page == total_pages
  end

  # Out of range of the collection?
  def out_of_range?
    current_page > total_pages
  end

  def range
    "#{range_start}-#{range_end}"
  end

  def current_page
    params[:page].to_i <= 1 ? 1 : params[:page].to_i
  end

  def total_pages
    total = (range_end - range_start)

    (total / per_page).ceil
  end

  def has_more_verses?
    range_end < chapter.verses_count
  end

  def has_previous_verses?
    range_start > 1
  end

  def show_bismillah?
    single_ayah? || chapter.bismillah_pre?
  end

  def single_ayah?
    # 2/255-255
    # 2/10
    # /ayat-ul-kursi all are single ayah

    @range_start.present? && (@range_end.nil? || @range_end == @range_start)
  end

  def continue?
    paginate.last.verse_number < chapter.verses_count
  end

  def continue_range
    context.range_path @chapter, "#{range_start}-#{chapter.verses_count}"
  end

  def previous_surah?
    chapter.chapter_number - 1 if chapter.chapter_number > 1
  end

  def next_surah?
    chapter.chapter_number + 1 if chapter.chapter_number < 114
  end

  def params_for_verse_link
    strong_memoize :verse_link_params do
      if (translation = valid_translations).present?
        "?translations=#{translation.join(',')}"
      end
    end
  end

  def render_translations?
    strong_memoize :render_translation do
      valid_translations.present?
    end
  end

  def show_verse_actions?
    true
  end

  def load_translations(verse, default_translation = nil)
    translations_to_load = valid_translations

    translations_to_load = [default_translation] if default_translation && translations_to_load.blank?

    verse.translations.where(resource_content_id: translations_to_load).order('translations.priority ASC')
  end

  def meta_page_type
    'article'
  end

  def meta_keyword
    chapter.translated_names.pluck(:name) + ['القران الكريم',
                                             'القرآن',
                                             'قران',
                                             'quran']
  end

  def meta_description
    strong_memoize :meta_description do
      first_verse = paginate.first
      translation = load_translations(first_verse, DEFAULT_TRANSLATION).first

      "Surah #{chapter.name_simple} #{paginate.first.verse_key} #{sanitize_meta_description_text(translation.text)}"
    end
  end

  def meta_url
    first_verse = paginate.first

    translations = valid_translations

    query_hash = {}
    query_hash[:font] = params[:font]
    query_hash[:translations] = translations.join(',').presence
    query_hash.compact!

    query_string = query_hash.present? ? "?#{query_hash.to_query}" : ''

    "https://quran.com/#{first_verse.verse_key.sub(':', '/')}#{query_string}"
  end

  def meta_title
    "Surah #{chapter.name_simple} - #{paginate.first.verse_key}"
  end

  def meta_image
    "https://exports.qurancdn.com/images/#{paginate.first.verse_key}.png?color=black&font=qcfv1&fontSize=50&translation=131"
  end

  protected

  def verses(verse_start, per)
    return @verses if @verses

    verse_end = verse_pagination_end(verse_start, per)

    list = Verse
             .where(chapter_id: chapter.id)
             .where('verse_number >= ? AND verse_number <= ?', verse_start.to_i, verse_end.to_i)

    list = list.where(word_translations: {language_id: language.id})
             .or(list.where(word_translations: {language_id: Language.default.id}))
             .eager_load(words: eager_load_words)

    list.order('verses.verse_index ASC, words.position ASC, word_translations.priority ASC')
  end

  def eager_load_words
    %i[
      word_translation
      transliteration
    ]
  end

  def range_end
    if @range_start && @range_end.nil?
      # For single ayah(e.g 2/1) range start and end should be same. One ayah

      range_start
    else
      min((@range_end || chapter.verses_count).to_i, chapter.verses_count)
    end
  end

  def range_start
    start = (@range_start || 1).to_i

    min(start, chapter.verses_count)
  end

  def verse_pagination_start
    (((current_page - 1) * per_page) + range_start).to_i
  end

  def verse_pagination_end(start, per)
    min((start + per) - 1, range_end)
  end

  def min(a, b)
    a < b ? a : b
  end
end
