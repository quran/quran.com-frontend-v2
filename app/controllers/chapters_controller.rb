class ChaptersController < ApplicationController
  def index
    @presenter = HomePresenter.new(self)
  end

  def show
    @presenter = HomePresenter.new(self)
  end
end
