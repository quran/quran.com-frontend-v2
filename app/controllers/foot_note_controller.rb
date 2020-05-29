# frozen_string_literal: true

class FootNoteController < ApplicationController
  def show
    @foot_note = FootNote.find(params[:id])

    render partial: 'foot_note/show', change: "#{view_context.dom_id(@foot_note.resource)}_footnotes" if request.xhr?
  end
end
