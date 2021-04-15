# frozen_string_literal: true

class SearchPresenter < BasePresenter
  attr_accessor :navigation_results

  def add_navigational_results(search)
    @navigation_results = search.results
  end

  def add_search_results(search_response)
    @search = search_response
    @translations = []
    @results = @search.results
  end

  def show_header_search?
    false
  end

  def no_results?
    return ture if @search.nil?

    @search.empty?
  end

  def next_page
    pagination.next
  end

  def result_size
    pagination.count
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

  def verses
    strong_memoize :items do
      Verse.unscoped.where(id: @results.keys).each do |v|
        documents = @results[v.id]
        v.highlighted_translations = []

        documents.each do |document|
          if document['type'] == 'verse'
            v.highlighted_text = document[:text]&.html_safe
          else
            v.highlighted_translations.push(document)
          end
        end

        v.highlighted_text ||= v.text_uthmani
      end
    end
  end

  def pagy_get_vars(collection, vars)
    vars[:count] ||= (c = collection.count(:all)).is_a?(Hash) ? c.size : c
    vars[:page] ||= params[vars[:page_param] || VARS[:page_param]]
    vars
  end
end
