class JuzPresenter < QuranPresenter
  def initialize(context)
    super
    @finder = verse_finder
  end

  def page_heading
    "Juz #{current_juz}"
  end

  def verses
    strong_memoize :verses do
      @finder.load_verses(
          filter: "juz",
          language: language,
          translations: valid_translations,
          words: true
      )
    end
  end

  def continue?
    true
  end

  def valid_juz?
    current_juz > 0 && current_juz < 31
  end

  def verse_keys
    Verse.where(juz_number: current_juz).order('verse_index ASC').pluck(:verse_key)
  end

  def next_juz
    current_juz + 1 if current_juz < 30
  end

  def previous_juz
    current_juz - 1 if current_juz > 1
  end

  def current_juz
    params[:juz_number].to_i.abs
  end
  alias current current_juz

  def last_verse
    # For juz view, we don't use page for paginating.
    verses.last
  end
end
