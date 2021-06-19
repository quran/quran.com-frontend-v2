class FeedbackController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    headers["Access-Control-Allow-Origin"] = 'https://quran.com'

    feedback = Feedback.new(feedback_params)

    if feedback.save
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
