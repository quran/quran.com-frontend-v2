# frozen_string_literal: true

class HomePresenter < QuranPresenter
  def chapters
    strong_memoize :chapters do
      ChapterFinder.new.all_with_translated_names(language: language)
    end
  end

  def juz
    Juz.order('juz_number ASC')
  end

  def cache_key
    "#{current_locale}-home"
  end

  def show_header_search?
    false
  end
end
