class AdvanceCopyPresenter < BasePresenter
  def cache_key(action_name:)
    "advance_copy:#{action_name}-#{verse.id}-#{translations_ids}:#{fetch_locale}"
  end

  def translations
    ResourceContent.where(id: valid_translations)
  end

  def verse
    Verse.find(params[:verse_id])
  end
end
