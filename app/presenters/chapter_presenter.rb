# frozen_string_literal: true

class ChapterPresenter < HomePresenter
  def initialize(context)
    super
    @finder = VerseFinder.new(params)
  end

  def show_header_search?
    true
  end

  def verses
    strong_memoize :verses do
      @finder.load_verses(
          filter: 'chapter',
          language: language,
          translations: valid_translations(store_result: store_translations?),
          words: true
      )
    end
  end

  def params_for_copy(verse)
    "#{params_for_verse_link}&verse=#{verse.verse_key}&chapter=#{chapter.id}&range=#{ayah_range_for_copy}"
  end

  def cache_key
     "c:#{chapter&.id}-#{font_type}-r:#{reading_mode?}-tr:#{valid_translations.join('-')}-range:#{ayah_range}-p:#{current_page}-#{params[:start]}"
  end

  def translation_view_path
    context.ayah_range_path(chapter, range: ayah_range, reading: false)
  end

  def reading_view_path
    context.ayah_range_path(chapter, range: ayah_range, reading: true)
  end

  def continue?
    has_more_verses?
  end

  def continue_path
    context.ayah_range_path(chapter, range: "#{ayah_range_from}-#{total_verses}")
  end

  def chapter
    strong_memoize :chapter do
      Chapter.find_using_slug(params[:id])
    end
  end

  def name_simple
    chapter.name_simple
  end

  def translated_name
    chapters[chapter.chapter_number - 1].translated_name.name
  end

  # Out of range of the collection?
  def out_of_range?
    false
  end

  def ayah_range
    from = ayah_range_from
    to = ayah_range_to

    if from == to
      ayah_range_from.to_s
    else
      "#{ayah_range_from}-#{ayah_range_to}"
    end
  end

  def ayah_range_for_copy
    strong_memoize :ayah_range_copy do
      from = ayah_range_from
      to = ayah_range_to

      id_from =  QuranUtils::Quran.get_ayah_id(chapter.id, from)
      id_to =  QuranUtils::Quran.get_ayah_id(chapter.id, to)

      "#{id_from}-#{id_to}"
    end
  end

  def has_more_verses?
    if params[:to]
      params[:to].to_i < total_verses
    else
      true
    end
  end

  def has_previous_verses?
    ayah_range_from > 1
  end

  def show_bismillah?
    single_ayah? || chapter.bismillah_pre?
  end

  def ayah_range_from
    verse_from = max(1, (params[:from] || 1).to_i)
    min(verse_from, total_verses)
  end

  def ayah_range_to
    verse_to = (params[:to] || params[:from] || total_verses).to_i

    min(verse_to, total_verses)
  end

  def single_ayah?
    # 2/255-255
    # 2/10
    # /ayat-ul-kursi all are single ayah

    @range_start.present? && (@range_end.nil? || @range_end == @range_start)
  end

  def previous_surah?
    chapter.chapter_number - 1 if chapter.chapter_number > 1
  end

  def next_surah?
    chapter.chapter_number + 1 if chapter.chapter_number < 114
  end

  def show_verse_actions?
    true
  end

  def meta_keyword
    chapter.translated_names.pluck(:name) + ['القران الكريم',
                                             'القرآن',
                                             'قران',
                                             'quran']
  end

  def meta_description
    strong_memoize :meta_description do
      translation = first_verse.translations.first || first_verse.translations.find_by(resource_content_id: DEFAULT_TRANSLATION)

      "Surah #{chapter.name_simple}(#{chapter.name_arabic}) #{first_verse.verse_key} #{sanitize_meta_description_text(translation.text)}"
    end
  end

  def meta_url
    strong_memoize :meta_url do
      translations = valid_translations

      query_hash = {reading: reading_mode?, font: font_type}
      query_hash[:translations] = translations.join(',').presence
      query_hash.compact!

      query_string = query_hash.present? ? "?locale=#{context.fetch_locale}&#{query_hash.to_param}" : "?locale=#{context.fetch_locale}"

      if params[:range]
        "https://quran.com/#{chapter.id}:#{range}#{query_string}"
      else
        "https://quran.com/#{chapter.default_slug}#{query_string}"
      end
    end
  end

  def meta_title
    "Surah #{chapter.name_simple} - #{ayah_range || first_verse.verse_key}"
  end

  def meta_image
    # "https://exports.qurancdn.com/images/#{first_verse.verse_key}.png?color=black&font=qcfv1&fontSize=50&translation=131"

    "https://quran-og-image.vercel.app/#{first_verse.verse_key.tr(':', '/')}"
  end

  protected

  def total_verses
    chapter.verses_count
  end

  def min(a, b)
    a < b ? a : b
  end

  def max(a, b)
    a > b ? a : b
  end

  def store_translations?
    params[:store] != false
  end
end
