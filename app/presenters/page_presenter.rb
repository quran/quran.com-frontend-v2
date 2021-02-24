class PagePresenter < QuranPresenter
  def initialize(context)
    super
    @finder = verse_finder
  end

  def page_heading
    "Page #{current_page}"
  end

  def verses
    @finder = verse_finder

    @finder.load_verses(
        filter: "page",
        language: language,
        translations: valid_translations,
        words: true
    )
  end

  def valid_page?
    current_page > 0 && current_page < 605
  end

  def verse_keys
    Verse.where(page_number: current_page).order('verse_index ASC').pluck(:verse_key)
  end

  def current_page
    params[:page_number].to_i
  end
  alias current current_page

  def next_muhsaf_page
    current_page + 1 if current_page < 604
  end

  def previous_muhsaf_page
    current_page - 1 if current_page > 1
  end
end
