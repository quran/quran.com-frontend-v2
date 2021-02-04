# frozen_string_literal: true

class VersesController < ApplicationController
  before_action :init_presenter

  caches_action :share,
                :select_tafsirs,
                :tafsir,
                cache_path: :generate_localised_cache_key

  def share
    render layout: false
  end

  def select_tafsirs
    render layout: false
  end
  
  def copy_advanced
    render layout: false
  end
  
  def tafsir; end

  protected

  def init_presenter
    @presenter = VersePresenter.new(self)

    redirect_to '/', alert: t('errors.invalid_verse') unless @presenter.verse
  end

  def generate_localised_cache_key
    "#{controller_name}/#{action_name}/#{params[:id]}-#{params[:tafsir_id]}/#{fetch_locale}"
  end
end
