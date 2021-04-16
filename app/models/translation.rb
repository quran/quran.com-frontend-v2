# frozen_string_literal: true

# == Schema Information
#
# Table name: translations
#
#  id                  :integer          not null, primary key
#  language_id         :integer
#  text                :string
#  resource_content_id :integer
#  resource_type       :string
#  resource_id         :integer
#  language_name       :string
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  resource_name       :string
#

class Translation < QuranCoreRecord
  CLEAN_TEXT_REG = /<sup foot_note="?\d+"?>\d+<\/sup>[\d*\[\]]?/
  include LanguageFilterable

  belongs_to :verse
  belongs_to :resource_content
  belongs_to :language
  has_many :foot_notes

  scope :approved, -> { joins(:resource_content).where('resource_contents.approved = ?', true) }

  def clean_text_for_es
    clean = text.gsub(CLEAN_TEXT_REG, '')

    if 38 == language_id
      # English translation
      clean.gsub(/[\W]/, ' ')
    else
      clean
    end.strip
  end

  def document_type
    'translation'
  end

  def self.document_type
    'translation'
  end
end
