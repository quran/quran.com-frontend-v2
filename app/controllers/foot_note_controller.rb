# frozen_string_literal: true

class FootNoteController < ApplicationController
  def show
    @foot_note = FootNote.find(params[:id])

    render partial: 'foot_note/show' if request.xhr?
  end
end
