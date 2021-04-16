# frozen_string_literal: true

class ChapterInfoPresenter < BasePresenter
  delegate :revelation_place, :name_simple, :verses_count, :pages, to: :chapter
  attr_accessor :chapter

  def initialize(context)
    super context
    @chapter = Chapter.find(params[:id])
  end

  def info
    @info ||= ChapterInfo.where(chapter_id: params[:id]).filter_by_language_or_default(I18n.locale)
  end

  def meta_description
    info.short_text
  end

  def meta_title
    chapter.name_simple
  end
end
