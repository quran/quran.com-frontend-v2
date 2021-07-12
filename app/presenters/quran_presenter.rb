class QuranPresenter < BasePresenter
  DEFAULT_FONT_METHOD = 'code_v1'
  DEFAULT_FONT_TYPE = :v1

  QCF_FONTS = %i[v2 v1].freeze
  PAGES_WITH_CENTER_ALIGN = [1, 2, 42, 601, 602, 603, 604].freeze

  WORD_TEXT_TYPES = %i[
    v1
    v2
    indopak
    uthmani
    qpc_hafs
  ].freeze

  AVAILABLE_FONTS = {
    'v1' => :v1,
    'v2' => :v2,
    'uthmani' => :uthmani,
    'indopak' => :indopak,
    'qpc_hafs' => :qpc_hafs,
    'tajweed' => :tajweed
  }

  def initialize(context)
    super
    params[:reading] = 'true' == params[:reading]

    # Using this to track surah names shown
    @chapter_name_shown = {}
  end

  def verse_actions_heading(verse)
    "#{chapter_name_simple(verse)} - #{verse.verse_key}"
  end

  def show_chapter_name?(verse)
    if 1 == verse.verse_number && @chapter_name_shown[verse.chapter_id].nil?
      @chapter_name_shown[verse.chapter_id] = true
    end
  end

  def show_bismillah?(verse)
    ![1, 9].include?(verse.chapter_id)
  end

  def center_align_page?(page)
    PAGES_WITH_CENTER_ALIGN.include?(page)
  end

  def render_verse_words?
    strong_memoize :render_words do
      WORD_TEXT_TYPES.include?(font_type)
    end
  end

  def reading_mode?
    strong_memoize :reading_mode do
      reading = params[:reading].presence
      reading.to_s == 'true'
    end
  end

  def showing_qcf_font?
    QCF_FONTS.include? font_type
  end

  def active_tab
    if reading_mode?
      'reading'
    else
      'translation'
    end
  end

  def font_type(store: false)
    strong_memoize "font_type_#{store}" do
      font = params[:font].presence || session[:font]
      font = AVAILABLE_FONTS[font] || DEFAULT_FONT_TYPE

      if store
        session[:font] = font
      end

      font
    end
  end

  def params_for_verse_link
    strong_memoize :verse_link_params do
      query = { font: font_type }
      if (translation = valid_translations).present?
        query[:translations] = translation.join(',')
      end

      "?#{query.to_param}"
    end
  end

  def render_translations?
    strong_memoize :render_translation do
      valid_translations(store_result: false).present?
    end
  end

  def valid_translations(store_result: true)
    strong_memoize :valid_translations do
      saved = saved_translations

      if saved == 'no' || saved.blank?
        context.session[:translations] = 'no' if store_result
        []
      else
        saved = saved.split(',') if saved.is_a?(String)

        approved_translations = ResourceContent
                                  .approved
                                  .translations
                                  .one_verse

        with_ids = approved_translations.where(id: saved)
        translations = approved_translations
                         .where(slug: saved).or(with_ids).pluck(:id)

        if store_result
          context.session[:translations] = translations
        end

        translations
      end
    end
  end

  def saved_translations(load_stored: true)
    from_params = params[:translations].presence

    if load_stored
      from_params || session[:translations].presence || DEFAULT_TRANSLATION
    else
      from_params
    end
  end

  def chapter_name_simple(verse)
    strong_memoize "chapter_#{verse.chapter_id}_name" do
      verse.chapter.name_simple
    end
  end

  def first_verse
    verses.first
  end

  def last_verse
    verses.last
  end
end
