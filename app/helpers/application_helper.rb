module ApplicationHelper
  include Pagy::Frontend

  def page_classes
    "#{controller_name} #{action_name}"
  end

  def page_id
    "#{controller_name}-#{action_name}"
  end

  def current_locale
    I18n.locale.to_s
  end

end
