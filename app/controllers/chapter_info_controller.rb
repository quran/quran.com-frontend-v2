# frozen_string_literal: true

class ChapterInfoController < ApplicationController
  caches_action :show,
                cache_path: :generate_localised_cache_key

  def show
    @presenter = ChapterInfoPresenter.new(self)

    render partial: 'info', layout: false if request.xhr?
  end

  protected

  def generate_localised_cache_key
    "#{controller_name}/#{params[:id]}/#{fetch_locale}/xhr:#{request.xhr?}"
  end
end
