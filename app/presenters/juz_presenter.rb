class JuzPresenter < QuranPresenter
  def initialize(context)
    super
    @finder = verse_finder
  end

  def page_heading
    "Juz #{current_juz}"
  end

  def cache_key
    "j#{current_juz}-#{font_type}-r:#{reading_mode?}-t:#{valid_translations.join('-')}-#{params[:verse]||params[:after]}"
  end

  def meta_description
    "Quran juz reader for juz number #{current_juz} #{'juz amma' if juz_amma?}"
  end

  def meta_title
    if juz_amma?
      "Juz amma. Juz #{current_juz}"
    else
      "Quran Juz #{current_juz}"
    end
  end

  def meta_keyword
    if juz_amma?
      ["Juz amma", "Juz #{current_juz}", "Quran reader by juz", "Quran Juz #{current_juz}"]
    else
      ["Juz #{current_juz}", "Quran reader by juz", "Quran Juz #{current_juz}"]
    end
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

  def params_for_copy(verse)
    "#{params_for_verse_link}&verse=#{verse.verse_key}&juz=#{current_juz}"
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

  def juz_amma?
    30 == current_juz
  end
end
