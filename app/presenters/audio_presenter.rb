# frozen_string_literal: true

class AudioPresenter < BasePresenter
  def initialize(context)
    super context
    @verses = load_verses
  end

  def data
    json = {}

    @verses.each do |verse|
      json[verse.verse_number] = {
          audio: verse.audio.url,
          segments: verse.audio.segments
      }
    end

    json
  end

  protected

  def load_verses
    # TODO: add pagination?
    Verse
        .eager_load(:audio)
        .where(chapter_id: chapter_id, audio_files: {recitation_id: recitation_id})
  end

  def recitation_id
    # 7 is default recitation

    recitation = (
    params[:recitation].presence ||
        session[:recitation] || "7"
    )

    session[:recitation] = recitation
    
    recitation.to_i
  end

  def chapter_id
    params[:chapter] || params[:chapter_id]
  end
end
