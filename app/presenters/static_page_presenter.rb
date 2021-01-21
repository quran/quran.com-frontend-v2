# frozen_string_literal: true

class StaticPagePresenter < BasePresenter
  def meta_title
    context.action_name.humanize
  end
end
