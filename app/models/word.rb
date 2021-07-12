# frozen_string_literal: true

# == Schema Information
#
# Table name: words
#
#  id             :integer          not null, primary key
#  verse_id       :integer
#  chapter_id     :integer
#  position       :integer
#  text_madani    :text
#  text_indopak   :text
#  text_simple    :text
#  verse_key      :string
#  page_number    :integer
#  class_name     :string
#  line_number    :integer
#  code_dec       :integer
#  code_hex       :string
#  code_hex_v3    :string
#  code_dec_v3    :integer
#  char_type_id   :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  pause_name     :string
#  audio_url      :string
#  image_blob     :text
#  image_url      :string
#  location       :string
#  topic_id       :integer
#  token_id       :integer
#  char_type_name :string
#

class Word < ApplicationRecord
  belongs_to :verse
  belongs_to :char_type
  belongs_to :topic
  belongs_to :token

  has_many :transliterations, as: :resource
  has_many :word_translations

  has_many :word_lemmas
  has_many :lemmas, through: :word_lemmas
  has_many :word_stems
  has_many :stems, through: :word_stems
  has_many :word_roots
  has_many :roots, through: :word_roots

  has_one :word_corpus

  # For eager loading
  has_one :word_translation
  has_one :transliteration, -> { where(language_id: 38) }, as: :resource

  default_scope { order 'position asc' }

  def get_page_number(version)
    if :v1 == version
      page_number
    else
      v2_page
    end
  end

  def get_line_number(version)
    if :v1 == version
      line_number
    else
      line_v2
    end
  end

  def get_text(version)
    case version
    when :v1
      code_v1
    when :v2
      code_v2
    when :uthmani, :tajweed
      text_uthmani
    when :indopak
      text_indopak
    when :qpc_hafs
      qpc_uthmani_hafs
    end
  end
end
