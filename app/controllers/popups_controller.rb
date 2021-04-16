class PopupsController < ApplicationController
  POPUPS = ['feedback', 'donation']

  def show
    if POPUPS.include?(params[:popup])
      @popup = params[:popup]
    else
      @popup = 'invalid'
    end

    render layout: false
  end
end
