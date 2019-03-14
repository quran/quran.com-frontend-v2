# frozen_string_literal: true

class VersesController < ApplicationController
  def tooltip
    presenter = VersePresenter.new(self)
    render json: presenter.data.to_json
  end
end
