class VersesController < ApplicationController
  before_action :init_presenter

  def share
    render layout: false
  end

  def select_tafsirs
    @approved_tafsirs = ResourceContent.tafsirs.approved

    render layout: false
  end

  def tafsir
  end

  protected

  def init_presenter
    @presenter = VersePresenter.new(self)
  end
end
