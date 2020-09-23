# frozen_string_literal: true

class ChapterInfoController < ApplicationController
  def show
    @presenter = ChapterInfoPresenter.new(self)

    render partial: 'info', layout: false if request.xhr?
  end
end
