# frozen_string_literal: true

class ChapterInfoController < ApplicationController
  include PartialReplacement::Redirection

  def show
    @presenter = ChapterInfoPresenter.new(self)

    render partial: 'chapter_info/info', change: 'chapter-info' if request.xhr?
  end
end
