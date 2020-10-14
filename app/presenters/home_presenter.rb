# frozen_string_literal: true

class HomePresenter < BasePresenter
  def initialize(view_context)
    super view_context
  end

  def chapters
    return @chapters if @chapters

    chapters = Chapter.eager_load(:translated_name)

    # Eager load translated names to avoid n+1 queries
    chapters_with_default_names = chapters
                                    .where(translated_names: {language_id: Language.default.id})

    @chapters = chapters
                  .where(translated_names: {language_id: language.id})
                  .or(chapters_with_default_names)
                  .order('translated_names.language_priority DESC')
  end

  def juz
    Juz.order('juz_number ASC')
  end

  def cache_key
    'home'
  end
end
