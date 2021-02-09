class AdvanceCopyPresenter < BasePresenter
  def cache_key(action_name:)
    "#{current_locale}-advance_copy:#{action_name}-#{verse.id}-#{valid_translations.join('-')}"
  end

  def translations
    ResourceContent.where(id: valid_translations)
  end

  def verse
    Verse.find(params[:verse_id])
  end
end
