class MushafWordPosition < QuranCoreRecord
  belongs_to :word
  belongs_to :mushaf
  belongs_to :verse
  belongs_to :char_type

  has_one :word_translation
end
