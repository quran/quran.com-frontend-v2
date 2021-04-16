class AdvanceCopyController < ApplicationController
  before_action :init_presenter
  caches_action :copy_options,
                :copy_text,
                cache_path: :generate_localised_cache_key

  def copy_options
    render layout: false
  end

  def copy_text
    render layout: false
  end

  protected
  def init_presenter
    @presenter = AdvanceCopyPresenter.new(self)
  end

  def generate_localised_cache_key
    @presenter.cache_key(action_name: action_name)
  end
end
