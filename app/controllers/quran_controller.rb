class QuranController < ApplicationController
  before_action :init_presenter
  caches_action :page,
                :juz,
                :juz_verses,
                cache_path: :generate_localised_cache_key

  def page
    if !@presenter.valid_page?
      return redirect_to root_path, error: t('errors.invalid_page')
    end

    render partial: 'verses', layout: false if request.xhr?
  end

  def juz
    if !@presenter.valid_juz?
      return redirect_to root_path, error: t('errors.invalid_juz')
    end

    render partial: 'verses', layout: false if request.xhr?
  end

  def juz_verses
    params[:after] = Verse.find_by(verse_key: params[:verse]).id

    render layout: false
  end

  protected

  def generate_localised_cache_key
    "quran:xhr#{request.xhr?}/#{@presenter.cache_key}/#{fetch_locale}"
  end

  def init_presenter
    case action_name
    when 'juz', 'juz_verses'
      @presenter = JuzPresenter.new(self)
    when 'page'
      @presenter = PagePresenter.new(self)
    end
  end
end
