# frozen_string_literal: true

class ChapterFinder
  def find_with_translated_name(id_or_slug, language_code = 'en')
    all_with_translated_names(language_code).find_using_slug(id_or_slug)
  end

  def all_with_translated_names(language: Language.default)
    chapters = Chapter.includes(:translated_name)

    # Eager load translated names to avoid n+1 queries
    # Fallback to english translated names
    # if chapter don't have translated name for queried language
    with_default_names = chapters
                           .where(translated_names: { language_id: Language.default.id })

    @chapters = chapters
                  .where(translated_names: { language_id: language.id })
                  .or(
                    with_default_names
                  )
                  .order('translated_names.language_priority DESC')
  end
end
