# frozen_string_literal: true

class FootNoteController < ApplicationController
  #caches_action :show,
  #              cache_path: :generate_localised_cache_key
  after_action :cache_on_edge
  before_action :redirect_non_xhr_requests

  def show
    @foot_note = FootNote.find_by(id: params[:id])
    render partial: 'foot_note/show'
  end

  protected

  def generate_localised_cache_key
    "#{controller_name}/#{action_name}/#{params[:id]}/#{fetch_locale}"
  end
end
