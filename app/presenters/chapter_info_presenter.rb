# frozen_string_literal: true

class ChapterInfoPresenter < BasePresenter
  def info
    @info ||= ChapterInfo.where(chapter_id: params[:id]).filter_by_language_or_default(I18n.locale)
  end
end
