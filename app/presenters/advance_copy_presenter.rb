class AdvanceCopyPresenter < BasePresenter
  FOOT_NOTE_REG = /<sup foot_note=\d+>(\d+)<\/sup>/
  TAG_SANITIZER = Rails::Html::WhiteListSanitizer.new

  def cache_key(action_name:)
    "#{current_locale}-advance_copy:#{action_name}-#{verse.id}-#{valid_translations.join('-')}"
  end

  def translations
    ResourceContent.where(id: valid_translations)
  end

  def verse
    Verse.find(params[:verse_id])
  end

  def verses_to_copy
    @verses = Verse.order('verses.verse_number asc')
                  .where(chapter_id: params[:chapter_id])
                  .where("verses.verse_number >= ? AND verses.verse_number <= ?", params[:from], params[:to])

    if (valid_translations.present?)
      @verses = @verses
                    .where(translations: {resource_content_id: valid_translations})
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
    'yes' == params[:footnote]
  end

  def range
    if params[:range].present?
      params[:range].split('-').map(&:to_i)
    else
      []
    end
  end
end
