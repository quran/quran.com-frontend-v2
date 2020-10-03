class SettingsController < ApplicationController
  def show
    @presenter = AudioPresenter.new(self)
    render layout: false
  end

  def translations
    render layout: false
  end

  def recitations
    @presenter = AudioPresenter.new(self)

    render layout: false
  end

  def fonts
    render layout: false
  end
end
