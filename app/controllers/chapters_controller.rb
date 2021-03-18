# frozen_string_literal: true

class ChaptersController < ApplicationController
  before_action :check_routes, only: :show
  before_action :init_presenter

  caches_action :index,
                :show,
                :ayatul_kursi,
                :load_verses,
                cache_path: :generate_localised_cache_key

  def index; end

  def show
    return redirect_to root_path, error: t('errors.invalid_chapter') unless @presenter.chapter
    return redirect_to chapter_path(@presenter.chapter), error: t('errors.invalid_verse') if @presenter.out_of_range?

    render partial: 'verses', layout: false if request.xhr?
  end

  def ayatul_kursi
    if request.xhr?
      render partial: 'verses', layout: false
    else
      render action: :show
    end
  end

  def load_verses
    verse = Verse.find_by(verse_key: params[:start_from])
    params[:from] = verse.verse_number
    params[:to] = verse.chapter.verses_count

    render layout: false
  end

  def referenced_verse
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

    chapter = params[:id][/\d+/]

    if (path, error = chapter.presence && validate_chapter_rules(chapter))
      redirect_to path, error: error
    elsif (path, error = validate_range_rules)
      redirect_to path, error: error
    end
  end

  def validate_chapter_rules(chapter)
    chapter_id = chapter.to_i.abs

    if chapter_id < 1 || chapter_id > 114
      [root_path, t('chapters.invalid')]
    elsif chapter_id.to_s != chapter
      ayah_range_path(chapter_id, get_valid_range_params)
    end
  end

  def validate_range_rules
    expected = get_valid_range_params

    ayah_range_path(params[:id], range: expected) if expected != current_ayah_range
  end

  def get_valid_range_params
    if params[:from].presence
      start = params[:from]
      finish = params[:to]

      valid_start = start.to_i.abs
      valid_end = finish.to_i.abs

      if finish.nil?
        return valid_start.zero? ? nil : valid_start.to_s
      end

      valid_start, valid_end = valid_end, valid_start if valid_start > valid_end
      valid_end = valid_start if valid_end.zero?

      if valid_start == valid_end
        # 2/4-4 should redirect to 2/4
        valid_start.to_s
      else
        "#{valid_start}-#{valid_end}"
      end
    end
  end

  def init_presenter
    @presenter = case action_name
                 when 'ayatul_kursi'
                   AyatulKursiPresenter.new(self)
                 when 'load_verses', 'referenced_verse'
                   @presenter = ChapterPresenter.new(self)
                 else
                   ChapterPresenter.new(self)
                 end
  end

  def generate_localised_cache_key
    key = @presenter.cache_key rescue 'invalid-route'
    "#{fetch_locale}-verses-#{action_name}:xhr#{request.xhr?}-#{key}"
  end

  def current_ayah_range
    if params[:from]
      if params[:to]
        "#{params[:from]}-#{params[:to]}"
      else
        params[:from]
      end
    end
  end
end
