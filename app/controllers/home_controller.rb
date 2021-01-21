class HomeController < ApplicationController
  caches_action :show,
                cache_path: :page_cache_key

  def show
    @presenter = HomePresenter.new(self)
  end

  protected

  def page_cache_key
    "/home:#{request.xhr?}/#{fetch_locale}"
  end
end
