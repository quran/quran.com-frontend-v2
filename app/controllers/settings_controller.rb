class SettingsController < ApplicationController
  before_action :init_presenter

  def show
    render layout: false
  end

  def translations
    render layout: false
  end

  def recitations
    render layout: false
  end

  def fonts
    render layout: false
  end

  def init_presenter
    @presenter = SettingPresenter.new(self)
  end
end
