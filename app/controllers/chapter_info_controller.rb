class ChapterInfoController < ApplicationController
  include PartialReplacement::Redirection

  def show
    @presenter = ChapterInfoPresenter.new(self)

    if request.xhr?
      render partial: 'chapter_info/info', change: 'chapter-info'
    end
  end
end
