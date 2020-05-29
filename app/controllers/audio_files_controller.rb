# frozen_string_literal: true

class AudioFilesController < ApplicationController
  # caches_action :index, expires_in: 30.days, cache_path: :action_cache_key

  def index
    presenter = AudioPresenter.new(self)
    render json: presenter.data.to_json
  end

  protected

  def action_cache_key
    "audio-#{params[:chapter]}-#{params[:page]}-#{params[:recitation]}"
  end
end
