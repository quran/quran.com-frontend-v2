class FeedbackController < ApplicationController
  def create
    contact_us = Feedback.new(feedback_params)

    if contact_us.save
      render json: { message: "Thank you! We'll get back to you soon إن شاء الله" }
    else
      render json: { message: 'Sorry something went wrong.' }
    end
  end

  protected

  def feedback_params
    params
      .require(:feedback)
      .permit(
        :name,
        :email,
        :message,
        :url
      )
  end
end
