# frozen_string_literal: true

class AyatulKursiPresenter < ChapterPresenter
  def verses
    finder = VerseFinder.new(params)
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
    'ayat-ul-kursi'
  end
end
