class VersePresenter < BasePresenter
  def initialize(context)
    super context
    @words = load_words
  end

  def data
    json = {}
    @words.each do |w|
      json[w.id] = {
          translation: {
              text: w.translation&.text,
              language: w.translation&.language_name
          },
          transliteration: {
              text: w.transliteration&.text,
              language: w.transliteration&.language_name
          }
      }
    end

    json
  end

  protected

  def load_words
    Word.
        eager_load(:translation, :transliteration).
        where("translations.language_id = ? OR translations.language_id = ?", language.id, Language.default.id).
        where("translations.language_id = ? OR translations.language_id = ?", language.id, Language.default.id).
        order("translations.priority ASC").
        where(verse_id: params[:id])
  end
end