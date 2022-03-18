# frozen_string_literal: true

class HomeController < ApplicationController
  caches_action :show,
                cache_path: :page_cache_key
  after_action :cache_on_edge
  before_action :redirect_non_xhr_requests

  def show
    @presenter = HomePresenter.new(self)
  end

  protected

  def page_cache_key
    "/home:#{request.xhr?}/#{fetch_locale}"
  end
end
