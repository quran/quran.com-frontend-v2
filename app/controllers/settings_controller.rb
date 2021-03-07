# frozen_string_literal: true

class SettingsController < ApplicationController
  layout false
  before_action :init_presenter
  caches_action :show,
                :translations,
                :recitations,
                :fonts,
                cache_path: :generate_localised_cache_key

  def show; end

  def translations; end

  def recitations; end

  def fonts; end

  def locales; end

  protected

  def init_presenter
    @presenter = SettingPresenter.new(self)
  end

  def generate_localised_cache_key
    resource_key = params.permit(:chapter, :juz_number, :page_number).to_query
    "#{controller_name}/#{action_name}/#{resource_key}/#{fetch_locale}"
  end
end
