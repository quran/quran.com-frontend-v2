module ChaptersHelper
  def related_sites
    [
      ['http://sunnah.com/', _t('related_sites.sunnah'), _t('related_sites.sunnah_description')],
      ['http://quranicaudio.com/', _t('related_sites.audio'), _t('related_sites.audio_description')],
      ['http://salah.com/', _t('related_sites.salah'), _t('related_sites.salah_description')]
    ]
  end

  def chapter_next_page_link
    if @presenter.next_page
      link_to 'load more', {page: @presenter.next_page}, rel: 'next'
    end
  end
end
