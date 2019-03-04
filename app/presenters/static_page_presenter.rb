class StaticPagePresenter < BasePresenter
  def initialize(view_context)
    super view_context
  end

  def meta_title
    context.action_name.humanize
  end
end