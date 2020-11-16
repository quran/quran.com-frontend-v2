class SettingsController < ApplicationController
  layout false
  before_action :init_presenter
  caches_action :show,
                :translations,
                :recitations,
                :fonts,
                cache_path: :generate_localised_cache_key

  def show;end

  def translations;end

  def recitations;end
  
  def fonts;end

  protected

  def init_presenter
    @presenter = SettingPresenter.new(self)
  end

  def generate_localised_cache_key
    "#{controller_name}/#{action_name}/#{params[:chapter]}/#{fetch_locale}"
  end
end
