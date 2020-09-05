class SettingsController < ApplicationController
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
end
