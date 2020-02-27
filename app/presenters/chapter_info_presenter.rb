# frozen_string_literal: true

class ChapterInfoPresenter < BasePresenter
  delegate :revelation_place, :name_simple, :verses_count, :pages, to: :chapter

  def info
    @info ||= ChapterInfo.where(chapter_id: params[:id]).filter_by_language_or_default(I18n.locale)
  end

  def chapter
    Chapter.find(params[:id])
  end
end
