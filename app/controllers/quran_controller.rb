class QuranController < ApplicationController
  def page
    @presenter = PagePresenter.new(self)

    if !@presenter.valid_page?
      return redirect_to root_path, error: t('errors.invalid_page')
    end

    render partial: 'verses', layout: false if request.xhr?
  end

  def juz
    @presenter = JuzPresenter.new(self)

    if !@presenter.valid_juz?
      return redirect_to root_path, error: t('errors.invalid_juz')
    end

    render partial: 'verses', layout: false if request.xhr?
  end
end
