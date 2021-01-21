# frozen_string_literal: true

class ChaptersController < ApplicationController
  before_action :check_routes, only: :show
  before_action :init_presenter

  caches_action :index,
                :show,
                :ayatul_kursi,
                :load_verses,
                cache_path: :generate_localised_cache_key

  def index
  end

  def show
    unless @presenter.chapter
      return redirect_to root_path, error: t('errors.invalid_chapter')
    end

    if @presenter.out_of_range?
      return redirect_to chapter_path(@presenter.chapter), error: t('errors.invalid_verse')
    end

    render partial: 'verses', layout: false if request.xhr?
  end

  def ayatul_kursi
    unless @presenter.chapter
      return redirect_to root_path, error: t('chapters.invalid')
    end

    if request.xhr?
      render partial: 'verses', layout: false
    else
      render action: :show
    end
  end

  def load_verses
    render layout: false
  end

  protected

  def check_routes
    #  Redirect Rules
    #  /002 => /2
    #  /002/002 => /2/2
    #  /2/20-2 => 2/2-20
    #  /2:8-9 => 2/
    #  /120 => invalid-surah
    #  /1/8 => invalid ayah
    #  /1/0 => /1

    range = params[:range]
    chapter = params[:id][/\d+/]

    if (path, error = chapter.presence && validate_chapter_rules(chapter))
      redirect_to path, error: error
    elsif (path, error = range.presence && validate_range_rules(range))
      redirect_to path, error: error
    end
  end

  def validate_chapter_rules(chapter)
    chapter_id = chapter.to_i.abs

    if chapter_id < 1 || chapter_id > 114
      [root_path, t('chapters.invalid')]
    elsif chapter_id.to_s != chapter
      range_path(chapter_id, get_valid_range_params)
    end
  end

  def validate_range_rules(range)
    expected = get_valid_range_params

    range_path(params[:id], range: expected) if expected != range
  end

  def get_valid_range_params
    if params[:range].presence
      start, finish = params[:range].split('-')
      valid_start = start.to_i.abs
      valid_end = finish.to_i.abs

      unless finish
        return valid_start.zero? ? nil : valid_start.to_s
      end

      valid_start, valid_end = valid_end, valid_start if valid_start > valid_end
      valid_end = valid_start if valid_end.zero?

      if valid_start > 0
        "#{valid_start}-#{valid_end}"
      else
        nil
      end
    end
  end

  def init_presenter
    @presenter = case action_name
                 when 'ayatul_kursi'
                   AyatulKursiPresenter.new(self)
                 when 'load_verses'
                   start = params[:verse].to_i
                   from = params[:from] || start
                   to = params[:to].to_i || start + 10

                   params[:range] = "#{from}-#{to}"
                   @presenter = ChapterPresenter.new(self)
                 else
                   ChapterPresenter.new(self)
                 end
  end

  def generate_localised_cache_key
    "verses:xhr#{request.xhr?}/#{@presenter.cache_key}/#{fetch_locale}"
  end
end
