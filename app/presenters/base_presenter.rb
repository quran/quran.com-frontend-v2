# frozen_string_literal: true

class BasePresenter
  HOST = 'https://www.quran.com'
  attr_reader :context, :resource_class

  def initialize(context)
    @context = context
  end

  delegate :params, to: :context

  delegate :session, to: :context

  def open_graph_hash
    {
      og: {
        title: meta_title,
        description: meta_description,
        url: meta_url,
        type: 'website',
        image: meta_image,
        'image:alt': 'Quran.com',
        see_also: related_links
      },
      # FB Applinks meta tags
      al:
            {
              web: { url: meta_url },
              ios: {
                url: 'https://itunes.apple.com/us/app/quran-by-quran.com-qran/id1118663303',
                app_store_id: '1118663303',
                app_name: 'Quran - by Quran.com - قرآن'
              },
              android: {
                url: 'https://play.google.com/store/apps/details?id=com.quran.labs.androidquran',
                app_name: 'Quran for Android',
                package: 'com.quran.labs.androidquran'
              }
            },
      twitter: {
        title: meta_title,
        description: meta_description,
        image: meta_image
      },
      title: meta_title,
      description: meta_description,
      keywords: meta_keyword,
      image: meta_image,
      canonical: canonical_href,
      alternate: alternate_links,
      'apple-itunes-app': 'app-id=1118663303',
      amphtml: canonical_href + '.amp'
    }
  end

  def alternate_links
    [
      { hreflang: 'x-default', href: canonical_href }

    ]
  end

  def meta_title
    'Quran.com'
  end

  def related_links; end

  def meta_url
    context.url_for locale: I18n.locale
  end
  alias canonical_href meta_url

  def meta_description
    'The Quran translated into many languages in a simple and easy interface'
  end

  def meta_keyword
    ['القران الكريم',
     'قران كريم',
     'القرآن',
     'قران',
     'quran',
     "qur'an",
     'koran',
     'kareem',
     'surah',
     'yasin',
     'yaseen',
     'kahf',
     'mulk',
     'rahman',
     'muslim',
     'islam',
     'Allah'].freeze
  end

  def meta_image
    context.view_context.image_url('thumbnail.png')
  end

  def language
    @language ||= Language.find_by(iso_code: I18n.locale) || Language.default
  end
end
