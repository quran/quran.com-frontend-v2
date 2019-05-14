# frozen_string_literal: true

class AudioFilesController < ApplicationController
  def index
    presenter = AudioPresenter.new(self)
    render json: presenter.data.to_json
  end
end
