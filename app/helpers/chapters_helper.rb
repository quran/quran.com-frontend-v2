# frozen_string_literal: true

module ChaptersHelper
  def related_sites
    [
      ['salah.jpg', 'http://salah.com/', _t('related_sites.salah'), _t('related_sites.salah_description')],
      ['sunnah.png', 'http://sunnah.com/', _t('related_sites.sunnah'), _t('related_sites.sunnah_description')],
      ['audio.png', 'http://quranicaudio.com/', _t('related_sites.audio'), _t('related_sites.audio_description')]
    ]
  end

  def quran_script_types
    [
      ['KFGQPC Font v1', 'v1'],
      ['KFGQPC Font v2', 'v2'],
      ['Uthmani Script', 'uthmani'],
      ['Imlaei Script', 'imlaei'],
      ['Indopak Script', 'indopak'],
      ['Uthmani with tajweed', 'tajweed'],
    ]
  end

  def chapter_next_page_link
    if @presenter.next_page
      link_to 'load more', range_path(@presenter.chapter.id, @presenter.range, page: @presenter.next_page, translations: @presenter.valid_translations), rel: 'next'
    end
  end

  def ordered_translations
    translations = ResourceContent.one_verse.translations.approved.order('priority ASC').pluck(:id, :name, :language_name)

    translations.group_by do |trans|
      trans[2]
    end
  end

  def recitations
    Recitation.approved.select(:id, :reciter_name, :style)
  end

  def font_ids(verses)
    verses.map(&:page_number).uniq
  end

  def popular_searches
    [
     ['/ayatul-kursi',  _t('search.ayatul_kursi')],
     ['/surah-ya-sin',  _t('search.yaseen')],
     ['/surah-al-mulk', _t('search.al_mulk')],
     ['/surah-ar-rahman', _t('search.ar_rahman')],
     ['/surah-al-waqiah', _t('search.al_waqiah')],
     ['/surah-al-kahf', _t('search.al_kahf')],
     ['/surah-al-muzzammil', _t('search.al_muzammil')]
    ]
  end
end
