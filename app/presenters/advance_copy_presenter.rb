class AdvanceCopyPresenter < QuranPresenter
  FOOT_NOTE_REG = /<sup foot_note=\d+>(\d+)<\/sup>/

  def cache_key(action_name:)
    "#{current_locale}-advance_copy:#{action_name}-#{copy_resource_with_range}-#{fetch_approved_translations.join('-')}"
  end

  def translations
    ResourceContent.where(id: fetch_approved_translations)
  end

  def current_verse
    Verse.where(verse_key: params[:verse]).first
  end

  def fetch_ayah_keys
    if copying_from_surah?
      Verse.order("verse_index ASC").where(chapter_id: params[:chapter]).pluck(:verse_key)
    elsif copying_from_juz?
      Verse.order("verse_index ASC").where(juz_number: params[:juz]).pluck(:verse_key)
    elsif copying_from_page?
      Verse.order("verse_index ASC").where(page_number: params[:page]).pluck(:verse_key)
    else
      []
    end
  end

  def verses_to_copy
    @verses = Verse.order('verses.verse_index asc')

    if (fetch_approved_translations.present?)
      @verses = @verses
                    .where(translations: {resource_content_id: fetch_approved_translations})
                    .eager_load(:translations)
                    .order('translations.priority ASC')
    end

    @verses
  end

  def format_translation_text(translation)
    text = translation.text

    if include_footnote?
      text = text.gsub(FOOT_NOTE_REG) do
        "[#{Regexp.last_match(1)}]"
      end
    else
      text = text.gsub(FOOT_NOTE_REG, '')
    end

    text.strip
  end

  def format_footnote_text(footnote)
    TAG_SANITIZER.sanitize(footnote.text, tags: [], attributes: []).strip
  end

  def include_footnote?
    strong_memoize :footnote do
      'yes' == params[:footnote]
    end
  end

  def include_arabic?
    strong_memoize :arabic do
      'yes' == params[:arabic]
    end
  end

  def copy_resource_with_range
    "#{include_footnote?}-#{include_arabic?}"
  end

  def fetch_approved_translations
    strong_memoize :approve_translations do
      valid_translations(store_result: false)
    end
  end

  def copying_from_surah?
    params[:chapter].present?
  end

  def copying_from_juz?
    params[:juz].present?
  end

  def copying_from_page?
    params[:page].present?
  end
end
