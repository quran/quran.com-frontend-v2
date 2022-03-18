# frozen_string_literal: true

class PagesController < ApplicationController
  after_action :cache_on_edge
  before_action :redirect_non_xhr_requests

  before_action :set_presenter
  caches_page :about_us,
              :apps,
              :donations,
              :support,
              :developers

  def about_us; end

  def apps; end

  def privacy; end

  def donations; end

  def support; end

  def developers; end

  def api
  end

  protected

  def set_presenter
    @presenter = StaticPagePresenter.new(self)
  end
end
