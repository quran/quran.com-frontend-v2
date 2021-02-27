# frozen_string_literal: true

class AyatulKursiPresenter < ChapterPresenter
  def initialize(context)
    super

    @finder = VerseFinder.new(params)
  end

  def verses
    strong_memoize :verses do
      [@finder.find_by_key(
          '2:255',
          language: language,
          translations: valid_translations,
          words: true
      )]
    end
  end

  def translation_view_path
    "/ayatul-kursi?reading=false"
  end

  def next_page
    false
  end

  def reading_view_path
    "/ayatul-kursi?reading=true"
  end

  def continue?
    true
  end

  def continue_path
    '/2/255-286'
  end

  def single_ayah?
    true
  end

  def meta_url
    'https://quran.com/ayatul-kursi'
  end

  def meta_title
    "Ayatul Kursi - Surah #{chapter.name_simple} 2:255"
  end

  def meta_keywords
    ['آیت الکرسی', 'ayatul kursi', 'Quran 2:255']
  end

  def cache_key
    "ayat-ul-kursi-#{context.fetch_locale}"
  end

  def chapter
    Chapter.find(2)
  end
end
