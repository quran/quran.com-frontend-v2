# frozen_string_literal: true

class AudioFilesController < ApplicationController
  before_action :init_presenter
  caches_action :index,
                cache_path: :generate_localised_cache_key

  def index
    render json: @presenter.data.to_json
  end

  protected

  def init_presenter
    @presenter = AudioPresenter.new(self)
  end

  def generate_localised_cache_key
    "#{controller_name}/#{@presenter.cache_key}"
  end
end
