# frozen_string_literal: true

class ChapterPresenter < BasePresenter
  def initialize(context)
    super context

    @range_start, @range_end = params[:range].to_s.split("-")
  end

  def chapter
    @chapter ||= Chapter.find_using_slug(params[:id])
  end

  def paginate
    @verses ||= verses(verse_pagination_start, per_page)
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

  def render_translations?
    valid_translations.present?
  end

  def load_words(verse)
    list = Word.where(verse_id: verse.id)

    list
        .where(word_translations: {language_id: language.id})
        .or(
            list.where(word_translations: {language_id: Language.default.id})
        )
        .eager_load(:transliteration, :word_translation).
        order("word_translations.priority ASC, words.position ASC")
  end

  def load_translations(verse)
    verse.translations.where(resource_content_id: valid_translations)
  end

  protected

  def meta_keyword
    chapter.translated_names.pluck(:name) + ["القران الكريم",
                                             "القرآن",
                                             "قران",
                                             "quran"]
  end

  def meta_description
    "Surah #{chapter.name_simple} #{paginate.first.verse_key} #{paginate.first.text_madani}"
  end

  def meta_url
    context.chapter_url(chapter)
  end

  def meta_title
    "Surah #{chapter.name_simple} - #{paginate.first.verse_key}"
  end

  def meta_image
    "https://exports.qurancdn.com/images/#{paginate.first.verse_key}.png?color=black&font=qcfv1&fontSize=50&translation=131"
  end

  def verses(verse_start, per)
    return @verses if @verses

    verse_end = verse_pagination_end(verse_start, per)

    list = Verse
               .where(chapter_id: chapter.id)
               .where("verse_number >= ? AND verse_number <= ?", verse_start.to_i, verse_end.to_i)

    list = list.where(word_translations: {language_id: language.id})
               .or(list.where(word_translations: {language_id: Language.default.id}))
               .eager_load(words: eager_load_words)

    list.order("verses.verse_index ASC, words.position ASC, word_translations.priority ASC")
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
      #
      range_start
    else
      min((@range_end || chapter.verses_count).to_i, chapter.verses_count)
    end
  end

  def range_start
    start = (@range_start || 1).to_i

    # Range start and end is inclusive while quering the data.
    # We don't want to repeat last ayah after first page
    # So start + 1
    start = current_page > 1 ? start + 1 : start

    min(start, chapter.verses_count)
  end

  def verse_pagination_start
    (((current_page - 1) * per_page) + range_start).to_i
  end

  def verse_pagination_end(start, per)
    min(start + per, range_end)
  end

  def min(a, b)
    a < b ? a : b
  end

  def valid_translations
    # 131 default translation

    return @trans if @trans

    translations = (
    params[:translation].presence ||
        params[:translations].presence ||
        session[:translation] || '131'
    )
    session[:translation] = translations
    @trans = translations.to_s.split(',')
  end
end
