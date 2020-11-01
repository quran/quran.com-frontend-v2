class SearchPresenter < BasePresenter
  def add_search_results(search_response)
    @search = search_response
    @translations = []
    @results = @search.results
  end

  def no_results?
    return ture if @search.nil?
    @search.empty?
  end

  def next_page
    pagination.next
  end

  def meta_description
    "Quran search result for #{query}"
  end

  def meta_title
    query
  end

  def pagination
    strong_memoize :pagination do
      @search&.pagination
    end
  end

  def render_translations?(verse)
    @results[verse.id][:translations].present?
  end

  def load_translations(verse)
    strong_memoize "translations_#{verse.id}" do
      translations = @results[verse.id][:translations].group_by do |t|
        t[:language]
      end

      translations.keys.each do |key|
        translations[key] = translations[key].map do |t|
          t[:texts]
        end.flatten
      end

      translations
    end
  end

  def show_verse_actions?
    true
  end

  def query
    params[:q].presence
  end

  def params_for_verse_link(verse)
    translations = load_translations(verse)
    translations_ids = translations.values.flatten.map do |t|
      t[:resource_id]
    end

    "?translations=#{translations_ids.join(',')}"
  end

  def items
    strong_memoize :items do
      if :navigation == @search&.result_type
        @results
      else
        Verse.unscoped.where(id: @results.keys).each do |v|
          highlights = @results[v.id]
          if highlights[:text].present?
            v.highlighted_text = highlights[:text].html_safe
          else
            v.highlighted_text = v.text_imlaei
          end
        end
      end
    end
  end

  def pagy_get_vars(collection, vars)
    vars[:count] ||= (c = collection.count(:all)).is_a?(Hash) ? c.size : c
    vars[:page] ||= params[vars[:page_param] || VARS[:page_param]]
    vars
  end
end
