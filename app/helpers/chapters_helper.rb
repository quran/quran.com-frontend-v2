# frozen_string_literal: true

module ChaptersHelper
  def related_sites
    [
        ['salah.jpg', "http://salah.com/", _t("related_sites.salah"), _t("related_sites.salah_description")],
        ['sunnah.png', "http://sunnah.com/", _t("related_sites.sunnah"), _t("related_sites.sunnah_description")],
        ['audio.png', "http://quranicaudio.com/", _t("related_sites.audio"), _t("related_sites.audio_description")]
    ]
  end

  def chapter_next_page_link
    if @presenter.next_page
      link_to "load more", range_path(@presenter.chapter.id, @presenter.range, page: @presenter.next_page), rel: "next"
    end
  end

  def ordered_translations
    translations = ResourceContent.one_verse.translations.order("priority desc").pluck(:id, :name, :language_name)

    translations.group_by do |trans|
      trans[2]
    end
  end

  def recitations
    Recitation.approved.select(:id, :reciter_name, :style)
  end

  def font_ids(verses)
    verses.map do |v|
      v.page_number
    end.uniq
  end
end
