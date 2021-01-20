# frozen_string_literal: true

class AudioPresenter < BasePresenter
  def initialize(context)
    super context
  end

  def data
    json = {}

    load_verses.each do |verse|
      audio = verse.audio

      json[verse.verse_number] = {
        audio: audio.url,
        segments: audio.segments,
        duration: audio.duration
      }
    end

    json
  end

  def cache_key
    "c:#{chapter_id}-r:#{recitation_id}-s:#{verse_start}-e:#{verse_end}"
  end

  protected

  def load_verses
    Verse
      .eager_load(:audio)
      .where(chapter_id: chapter_id, audio_files: {recitation_id: recitation_id})
      .where('verses.verse_number >= ? AND verses.verse_number <= ?', verse_start.to_i, verse_end.to_i)
  end

  def verse_start
    (current_page * per_page) + 1
  end

  def verse_end
    verse_start + per_page - 1
  end

  def per_page
    10
  end

  def current_page
    (params[:page].presence || 0).to_i
  end

  def recitation_id
    # 7 is default recitation
    strong_memoize :recitation do
      recitation = params[:recitation].presence || session[:recitation].presence || DEFAULT_RECITATION
      session[:recitation] = recitation
    end
  end

  def chapter_id
    params[:chapter] || params[:chapter_id]
  end
end
