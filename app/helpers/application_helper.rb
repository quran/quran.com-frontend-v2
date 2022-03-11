# frozen_string_literal: true

module ApplicationHelper
  include Pagy::Frontend

  def page_classes
    "#{controller_name} #{action_name} lang-#{current_locale}"
  end

  def page_id
    "#{controller_name}-#{action_name}"
  end

  def current_locale
    I18n.locale.to_s
  end

  def spinning_loader
    "<i class='fa-spinner1 animate-spin'></i> #{_t('loading')}".html_safe
  end

  def faq_list
    [ ['Can I download the Quran.com to my computer?', "Unfortunately, no. We do not provide functionality to download our website or the Quran to your computer yet. You can, however install our <a href='/apps'>mobile app</a> for offline reading."],
      ['Can I browse site in other languages?', "To change your preferred language, there is a drop down on the top right corner on each page( to right corner in the left side menu on mobile). Use this dropdown to choose your preferred language."],
      ['I found a translation bug, where do I file it?',
       "Please report this bug on Github repo <a target='_blank' href='https://github.com/quran/quran.com-api/issues/new?title=translation bug'>here</a> and we'll fix this bug ASAP inshAllah."],
      ['The site is not working, how do I tell you?',
       "That's not good! If the site is not working at all or perhaps you see a white screen with '502', we appreciate it if you can email us immediately to let us know. You can report this issue <a target='_blank' href='https://feedback.quran.com/b/bugs/'>here</a>."],
      ["I'm a developer. How can I contribute?", 'Please see <a href=/developers>developers page</a> for more info.'],
      ['Islamic/ Fiqh / Fatwa related questions',
       'Quran.com is an online reading, listening and studying tool. The team behind Quran.com is made up of software engineers, designers, and product managers. Unfortunately, that is the limitation of our skill set we do not have scholars, imams or sheikhs as part of the team to assist with Islamic, Fiqh or Fatwa related questions. We try to refrain from answering any of those questions and advise you speak to your local imam at a mosque or to a sheikh.'],
      ['Is Tafsir available?',
       "Yes, we do have some Tafsirs. Click on <span class='quran-icon icon-menu'></span> icon shown beside each ayah, then click on tafisrs. App will show you list of available tafsirs. Click on the tafsir you want to read."],
      ['Add another translations',
       "Open a new issue at <a href='https://feedback.quran.com/b/translation-and-reciter-requests/' target='_blank'>here</a> with all the detail, link to translation and we'll try our best to add this."],
      ['Adding more reciters',
       "Submit more info about this reciter <a target='_blank' href='https://feedback.quran.com/b/translation-and-reciter-requests/'>here</a>"],
      ['Does Quran.com have mobile app?',
       "Yes! Please visit <a href='/apps'>Apps page</a> to see our Android, and iOS apps."],
      ['How can I donate?',
       "Firstly, we really appreciate your interest to contribute. Please visit this <a href='https://quranfund.com/'>this link</a>."]
    ]
  end
end
