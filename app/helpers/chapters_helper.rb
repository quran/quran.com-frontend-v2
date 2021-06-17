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
      ['Uthmani with tajweed', 'tajweed']
    ]
  end

  def chapter_next_page_link
    if @presenter.next_page
      last = @presenter.last_verse
      next_ayah_key = QuranUtils::Quran.get_ayah_key_from_id(last.id + 1)

      next_page_link = ayah_range_path(
        @presenter.chapter,
        @presenter.ayah_range,
        start: next_ayah_key,
        reading: @presenter.reading_mode?,
        font: @presenter.font_type
      )

      link_to 'load more',
              next_page_link,
              rel: 'next',
              data: { remote: true },
              class: 'btn btn--lightgrey btn--large  btn--arrow-down'
    end
  end

  def juz_next_page_link
    if @presenter.next_page && @presenter.last_verse
      next_ayah_key = QuranUtils::Quran.get_ayah_key_from_id(@presenter.last_verse.id + 1)

      next_link = quran_juz_path(@presenter.current_juz,
                                 start: next_ayah_key,
                                 reading: @presenter.reading_mode?,
                                 font: @presenter.font_type)

      link_to 'load more',
              next_link,
              rel: 'next',
              data: { remote: true },
              class: 'btn btn--lightgrey btn--large  btn--arrow-down'

    end
  end

  def font_ids(verses)
    pages = {}
    verses.each do |v|
      pages[v.page_number] = true
      pages[v.v2_page] = true
    end

    pages.keys
  end

  def popular_searches
    [
      ['/ayatul-kursi', _t('search.ayatul_kursi')],
      ['/surah-ya-sin', _t('search.yaseen')],
      ['/surah-al-mulk', _t('search.al_mulk')],
      ['/surah-ar-rahman', _t('search.ar_rahman')],
      ['/surah-al-waqiah', _t('search.al_waqiah')],
      ['/surah-al-kahf', _t('search.al_kahf')],
      ['/surah-al-muzzammil', _t('search.al_muzammil')]
    ]
  end
end
