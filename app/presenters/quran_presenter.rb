class QuranPresenter < BasePresenter
  DEFAULT_FONT_METHOD = 'code_v2'
  DEFAULT_FONT_TYPE = 'v2'
  QCF_FONTS = %w[v2 v1].freeze
  PAGES_WITH_CENTER_ALIGN = [1, 2, 42, 601, 602, 603, 604].freeze

  WORD_TEXT_TYPES = %w[
    v1
    v2
    indopak
    uthmani
    imlaei
  ].freeze

  FONT_METHODS = {
      'v1' => 'code_v1',
      'v2' => 'code_v2',
      'uthmani' => 'text_uthmani',
      'imlaei' => 'text_imlaei',
      'indopak' => 'text_indopak',
      'tajweed' => 'text_uthmani_tajweed'
  }.freeze

  def initialize(context)
    super
    params[:reading] = 'true' == params[:reading]
  end

  def show_chapter_name?(verse)
    1 == verse.verse_number
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

  def params_for_copy(verse)
    #"#{params_for_verse_link}&range=#{range}&from=#{verse.verse_number}"
  end

  def render_translations?
    strong_memoize :render_translation do
      valid_translations.present?
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

  def font_type(store: true)
    strong_memoize :font_type do
      font = params[:font].presence || session[:font]
      font = FONT_METHODS.key?(font) ? font : DEFAULT_FONT_TYPE

      if store
        session[:font] = font
      end

      font
    end
  end

  def font_method
    strong_memoize :font_method do
      font = font_type

      if reading_mode? && font == 'tajweed'
        # we don't have wbw data for tajweed, fallback to uthmani script
        font = 'uthmani'
      end

      FONT_METHODS[font]
    end
  end

  def params_for_verse_link
    strong_memoize :verse_link_params do
      if (translation = valid_translations).present?
        "?translations=#{translation.join(',')}"
      end
    end
  end

  def params_for_copy(verse)
    #"#{params_for_verse_link}&range=#{range}&from=#{verse.verse_number}"
  end

  def render_translations?
    strong_memoize :render_translation do
      valid_translations.present?
    end
  end

  def valid_translations(store_result: true)
    strong_memoize :valid_translations do
      saved = saved_translations

      if saved == 'no' || saved.blank?
        context.session[:translations] = 'no'
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
end
