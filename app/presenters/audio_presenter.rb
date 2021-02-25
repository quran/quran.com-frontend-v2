# frozen_string_literal: true

class AudioPresenter < QuranPresenter
  def data
    json = {}

    load_verses.each do |verse|
      audio = verse.audio

      json[verse.verse_key] = {
          audio: audio.url,
          segments: audio.segments,
          duration: audio.duration
      }
    end

    json
  end

  def cache_key
    "v:#{verse.verse_key}-r:#{recitation_id}-l:#{per_page}"
  end

  protected

  def load_verses
    current = verse
    verses = Verse.where("verse_index BETWEEN ? AND ?", current.id - 1, current.id + per_page - 1)
    verses
        .eager_load(:audio)
        .where(audio_files: {recitation_id: recitation_id})
  end

  def per_page
    10
  end

  def recitation_id
    # 7 is default recitation
    strong_memoize :recitation do
      recitation = params[:recitation].presence || session[:recitation].presence || DEFAULT_RECITATION
      session[:recitation] = recitation
    end
  end

  def verse
    Verse.find_by_verse_key(params[:verse])
  end
end
