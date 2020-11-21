# frozen_string_literal: true

class PagesController < ApplicationController
  before_action :set_presenter
  caches_page :about_us,
              :apps,
              :donations,
              :support,
              :developers

  def about_us; end

  def apps; end

  def privacy

  end

  def donations; end

  def support; end

  def developers; end

  protected

  def set_presenter
    @presenter = StaticPagePresenter.new(self)
  end
end
