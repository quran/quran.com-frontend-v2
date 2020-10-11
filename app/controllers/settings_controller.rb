class SettingsController < ApplicationController
  before_action :init_presenter

  caches_action :show,
                :translations,
                :recitations,
                :fonts,
                cache_path: :generate_localised_cache_key

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

  protected

  def generate_localised_cache_key
    "#{controller_name}/#{action_name}/#{fetch_locale}"
  end

  def init_presenter
    @presenter = SettingPresenter.new(self)
  end
end
