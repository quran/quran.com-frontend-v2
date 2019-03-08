class ChaptersController < ApplicationController
  def index
    @presenter = HomePresenter.new(self)
  end

  def show
    @presenter = ChapterPresenter.new(self)

    if request.xhr?
     render partial: 'verses', layout: false
    end
  end
end
