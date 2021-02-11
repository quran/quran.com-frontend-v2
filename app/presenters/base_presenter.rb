# frozen_string_literal: true

class BasePresenter
  include QuranUtils::StrongMemoize

  HOST = 'https://www.quran.com'
  DEFAULT_RECITATION = 7
  DEFAULT_TRANSLATION = 131 # Clear Quran with footnotes is default translation
  TAG_SANITIZER = Rails::Html::WhiteListSanitizer.new

  attr_reader :context, :resource_class, :request

  def initialize(context)
    @context = context
  end

  delegate :params, :session, :request, :action_name, to: :context

  def open_graph_hash
    {
      og: {
        title: meta_title,
        description: meta_description,
        url: meta_url,
        type: meta_page_type,
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
        creator: '@app_quran',
        site: '@app_auran',
        card: 'summary_large_image'
      },
      fb: {
        app_id: '342185219529773',
        pages: '603289706669016',
        article_style: 'quran'
      },
      title: meta_title,
      description: meta_description,
      keywords: meta_keyword,
      image: meta_image,
      canonical: canonical_url,
      'apple-itunes-app': 'app-id=1118663303'
    }
  end

  def meta_page_type
    'website'
  end

  def meta_title
    I18n.t('noble_quran')
  end

  def related_links; end

  def meta_url
    context.url_for(protocol: 'https', locale: current_locale)
  end

  def canonical_url
    meta_url
  end

  def meta_description
    'The Quran and the explanation of the Quran in many language, available in a simple and easy application'
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
    strong_memoize :language do
      Language.find_by(iso_code: I18n.locale) || Language.default
    end
  end

  def sanitize_meta_description_text(text)
    context.view_context.truncate(TAG_SANITIZER.sanitize(text.to_s, tags: [], attributes: []), length: 160, separator: '.')
  end

  def valid_translations
    if request.format.text? || params[:skip_sessions] == 'true'
      params[:translations].split(',')
    else
      strong_memoize :valid_translations do
        saved = saved_translations

        if saved == 'no' || saved.blank?
          context.session[:translations] = 'no'
          []
        else
          saved = saved.split(',') if saved.is_a?(String)

          approved_translations = ResourceContent
                                  .approved
                                  .translations
                                  .one_verse

          with_ids = approved_translations.where(id: saved)
          translations = approved_translations
                         .where(slug: saved).or(with_ids).pluck(:id)

          context.session[:translations] = translations
        end
      end
    end
  end

  def saved_translations
    params[:translations].presence ||
      session[:translations].presence ||
      params[:translations].presence || DEFAULT_TRANSLATION
  end

  def eager_load_translated_name(records)
    defaults = records.where(
      translated_names: { language_id: Language.default.id }
    )

    records
      .where(
        translated_names: { language_id: language }
      ).or(defaults).order('translated_names.language_priority DESC')
  end

  def current_locale
    context.fetch_locale
  end
end
