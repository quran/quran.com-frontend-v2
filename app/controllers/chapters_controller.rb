# frozen_string_literal: true

class ChaptersController < ApplicationController
  def index
    @presenter = HomePresenter.new(self)
  end

  def show
    @presenter = ChapterPresenter.new(self)

    render partial: 'verses', layout: false if request.xhr?
  end
end
