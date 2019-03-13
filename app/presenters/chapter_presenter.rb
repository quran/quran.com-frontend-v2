# frozen_string_literal: true

class ChapterPresenter < BasePresenter
  attr_accessor :current_page, :total_pages

  def initialize(context)
    super context

    @total_pages = (chapter.verses_count / per_page).ceil
  end

  def chapter
    @chapter ||= Chapter.find_using_slug(params[:id])
  end

  def paginate
    verses(verse_pagination_start, per_page)
  end

  def per_page
    10.0
  end

  # Next page number in the collection
  def next_page
    current_page + 1 unless last_page? || out_of_range?
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

  def meta_keyword
    chapter.translated_names.pluck(:name) + ['القران الكريم',
                                            'القرآن',
                                             'قران',
                                             'quran']
  end

  def meta_description
    "Surah #{chapter.name_simple} #{paginate.first.verse_key} #{paginate.first.text_madani}"
  end

  def meta_url
    context.chapter_url(chapter)
  end

  def meta_title
    "Surah #{chapter.name_simple}"
  end
  protected

  def verses(verse_start, per)
    return @verses if @verses



    verse_end = verse_pagination_end(verse_start, per)

    list = Verse
           .where(chapter_id: chapter.id)
           .where('verse_number >= ? AND verse_number < ?', verse_start.to_i, verse_end.to_i)

    list = list.where(translations: { language_id: language.id })
               .or(list.where(translations: { language_id: Language.default.id }))
               .includes(:translations, words: eager_load_words)
               .where(translations: eager_load_translations)

    @verses = list.order('verses.verse_index ASC, words.position ASC, translations.priority ASC')
  end

  def eager_load_words
    %i[
      translation
      transliteration
    ]
  end

  def eager_load_translations
    { resource_content_id: 131 }
  end

  def current_page
    params[:page].to_i <= 1 ? 1 : params[:page].to_i
  end

  def verse_pagination_start
    ((current_page - 1) * per_page) + 1
  end

  def verse_pagination_end(start, per)
    min(start + per, chapter.verses_count + 1)
  end

  def min(a, b)
    a < b ? a : b
  end
end
