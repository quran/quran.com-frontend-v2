class SearchPresenter < BasePresenter
  def add_search_results(search_response)
    @search = search_response
    @results = @search.results
  end

  def no_results?
    @search.empty?
  end

  def next_page
    pagination.next
  end

  def pagination
    strong_memoize :pagination do
      @search.pagination
    end
  end

  def render_translations?
    false
  end

  def show_verse_actions?
    true
  end

  def query
    params[:q].presence
  end

  def items
    strong_memoize :items do
      Verse.where(id: @results.keys).each do |v|
        highlights = @results[v.id]
        if highlights && highlights['text_madani.text']
          v.highlighted_text = highlights['text_madani.text'][0].html_safe
        else
          v.highlighted_text = v.text_madani
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
