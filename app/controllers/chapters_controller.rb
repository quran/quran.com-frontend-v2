# frozen_string_literal: true

class ChaptersController < ApplicationController
  before_action :check_routes, only: :show

  def index
    @presenter = HomePresenter.new(self)
  end

  def show
    @presenter = ChapterPresenter.new(self)

    unless @presenter.chapter
      return redirect_to root_path, error: t('chapters.invalid')
    end

    render partial: 'verses', layout: false if request.xhr?
  end

  def load_verses
    start = params[:verse].to_i
    params[:range] = "#{start}-#{start + 10}"
    @presenter = ChapterPresenter.new(self)

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
    #

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

      return valid_start.to_s unless finish

      valid_start, valid_end = valid_end, valid_start if valid_start > valid_end

      "#{valid_start}-#{valid_end}"
    end
  end
end
