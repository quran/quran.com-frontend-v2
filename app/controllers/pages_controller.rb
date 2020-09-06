# frozen_string_literal: true

class PagesController < ApplicationController
  before_action :set_presenter

  def about_us; end

  def apps; end

  def donations; end

  def help_and_feedback; end

  def developers; end

  protected

  def set_presenter
    @presenter = StaticPagePresenter.new(self)
  end
end
