# frozen_string_literal: true

class ChapterInfoController < ApplicationController
  def show
    @presenter = ChapterInfoPresenter.new(self)

    render partial: 'chapter_info/info', change: 'chapter-info' if request.xhr?
  end
end
