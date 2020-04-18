class VersePresenter < BasePresenter
  def verse
    if params[:id].to_s.include?(':')
      Verse.find_by_verse_key(params[:id])
    else
      Verse.find_by_id_or_key(params[:id])
    end
  end

  def tafsir_name
    tafsir.resource_name
  end

  def chapter
    verse.chapter
  end

  def params_for_verse_link
    {}
  end

  def share_url
    translations = valid_translations

    if translations.present?
      "https://www.quran.com/#{verse.verse_key.sub(':', '/')}?translations=#{translations.join(',')}"
    else
      "https://www.quran.com/#{verse.verse_key.sub(':', '/')}"
    end
  end

  def share_text
   verse.text_madani
  end

  def share_title
    "#{chapter.name_simple} - #{verse.verse_key} - Quran.com"
  end

  def render_translations?
    false
  end

  def font
    'v1'
  end

  def font_method
    'code'
  end

  def show_verse_actions?
    false
  end

  def tafsir_text
    tafsir.text
  end

  def meta_page_type
    'article'
  end

  def language_name
    tafsir.language_name
  end

  protected

  def tafsir
    strong_memoize :tafsir do
      verse.tafsirs.where(resource_content_id: tafirs_filter).first
    end
  end

  def tafirs_filter
    # Default tafsir is المیسر
    return 16 if params[:tafsir_id].blank?

    ResourceContent
        .where(id: params[:tafsir_id])
        .or(ResourceContent.where(slug: params[:tafsir_id]))
        .first&.id || 16
  end
end
