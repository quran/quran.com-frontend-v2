# frozen_string_literal: true

class StaticPagePresenter < BasePresenter
  def initialize(controller_context)
    super controller_context
  end

  def meta_title
    context.action_name.humanize
  end
end
