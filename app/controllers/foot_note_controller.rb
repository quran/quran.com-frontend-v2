# frozen_string_literal: true

class FootNoteController < ApplicationController
  caches_action :show, expires_in: 30.days, cache_path: :action_cache_key

  def show
    @foot_note = FootNote.find(params[:id])

    render partial: 'foot_note/show', change: "#{view_context.dom_id(@foot_note.resource)} #footnote"
  end

  protected
  def action_cache_key
    "footnote-#{params[:id]}-#{I18n.locale}"
  end
end
