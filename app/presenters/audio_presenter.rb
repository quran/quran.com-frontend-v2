# frozen_string_literal: true

class AudioPresenter < BasePresenter
  def initialize(context)
    super context
    @verses = load_verses
  end

  def data
    json = {}

    @verses.each do |verse|
      audio = verse.audio

      json[verse.verse_number] = {
        audio: audio.url,
        segments: audio.segments,
        duration: audio.duration
      }
    end

    json
  end

  protected

  def load_verses
    Verse
      .eager_load(:audio)
      .where(chapter_id: chapter_id, audio_files: { recitation_id: recitation_id })
      .where('verse_number >= ? AND verse_number <= ?', verse_start.to_i, verse_end.to_i)
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

    recitation = (
    params[:recitation].presence || DEFAULT_RECITATION
  ).to_i

    recitation
  end

  def chapter_id
    params[:chapter] || params[:chapter_id]
  end
end
