class AdvanceCopyPresenter < QuranPresenter
  FOOT_NOTE_REG = /<sup foot_note=\d+>(\d+)<\/sup>/

  def cache_key(action_name:)
    "#{current_locale}-advance_copy:#{action_name}-#{copy_resource_with_range}-#{fetch_approved_translations.join('-')}"
  end

  def translations
    if include_translations?
      ResourceContent.where(id: fetch_approved_translations)
    else
      []
    end
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
      Verse.order("verse_index ASC").where(page_number: params[:muhsaf_page]).pluck(:verse_key)
    else
      []
    end
  end

  def verses_to_copy
    verse_from = QuranUtils::Quran.get_ayah_id_from_key(params[:from])
    verse_to = QuranUtils::Quran.get_ayah_id_from_key(params[:to])

    @verses = Verse.order('verses.verse_index asc').where("verses.verse_index >= :from AND verses.verse_index <= :to", from: verse_from, to: verse_to)

    if (fetch_approved_translations.present?)
      @verses = @verses
                  .where(translations: { resource_content_id: fetch_approved_translations })
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

  def include_translations?
    fetch_approved_translations.any?
  end

  def first_ayah_in_range
    strong_memoize :range_first do
      if id = params[:range].to_s.split('-').first
        QuranUtils::Quran.get_ayah_key_from_id(id.to_i)
      end
    end
  end

  def last_ayah_in_range
    strong_memoize :range_last do
      if id = params[:range].to_s.split('-').last
        QuranUtils::Quran.get_ayah_key_from_id(id.to_i)
      end
    end
  end

  def include_arabic?
    strong_memoize :arabic do
      !ActiveRecord::Type::Boolean::FALSE_VALUES.include?(params[:arabic])
    end
  end

  def copy_resource_with_range
    "#{include_footnote?}-#{include_arabic?}-#{params[:range]}-#{params[:from]}-#{params[:to]}"
  end

  def fetch_approved_translations
    strong_memoize :approve_translations do
      params[:translations] = 'no' if params[:translations].blank?
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
    params[:muhsaf_page].present?
  end
end
