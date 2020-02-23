# frozen_string_literal: true

class VerseMedia
  # We have media only for first surah. Querying db don't make sense
  # hard coding media here
  MAPPING = {
    1 => 'JyLuLv2hrAo',
    2 => 'p83Dih4Bq9M',
    3 => 'PiaWO3Jh-84',
    4 => 'PEUw8ba9R_8',
    5 => '7lh29hWuw28',
    6 => 'IGImH6s70i0',
    7 => 'xwKnh4gQiJo'
  }.freeze

  class << self
    def get_media(verse_id)
      MAPPING[verse_id]
    end
  end
end
