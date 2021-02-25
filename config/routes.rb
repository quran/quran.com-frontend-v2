# frozen_string_literal: true

Rails.application.routes.draw do
  post 'fb', to: 'chapters#index'

  # surah in url for seo
  get '/surah/:id/info', to: 'chapter_info#show'
  get '/surah-info/:id', to: 'chapter_info#show'
  get '/:id/tafsirs/:tafsir_id', to: 'verses#tafsir', as: :verse_tafsir

  resources :chapter_info, only: :show
  resources :foot_note, only: :show

  get :search, to: 'search#search', as: :search
  get 'search/suggestion', to: 'search#suggestion'

  get '/settings', to: 'settings#show'
  get '/settings/translations', to: 'settings#translations'
  get '/settings/recitations', to: 'settings#recitations'
  get '/settings/fonts', to: 'settings#fonts'
  get '/settings/locales', to: 'settings#locales'

  get '/audio', to: 'audio_files#index'
  get '/ayatul-kursi', to: 'chapters#ayatul_kursi'
  get 'آیت الکرسی/', to: 'chapters#ayatul_kursi'

  get '/about-us', to: 'static#about_us', as: :about_us
  get :apps, to: 'pages#apps'
  get :donations, to: 'pages#donations'
  get :support, to: 'pages#support'
  get :privacy, to: 'pages#privacy'
  get :developers, to: 'pages#developers'
  get :api, to: 'pages#api'

  resources :verses, only: :show do
    member do
      get :share
      get :select_tafsirs
      get :tafsir
    end
  end

  root to: 'home#show'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  namespace :static do
    get :opensearch
    get :manifest
    get :msapplication_config
  end

  get :sw, to: 'static#serviceworker'
  get :serviceworker, to: 'static#serviceworker'
  get '/quran-service-worker', to: 'static#serviceworker'
  get '/manifest', to: 'static#manifest'
  get '/opensearch', to: 'static#opensearch'

  get '/sitemap.xml.gz' => proc { |_req|
    [
      200,
      {
        'Pragma' => 'public',
        'Cache-Control' => "max-age=#{1.day.to_i}",
        'Expires' => 1.day.from_now.to_s(:rfc822),
        'Content-Type' => 'text/html'
      },
      [open(Rails.root.join('public', 'sitemaps', 'sitemap.xml.gz')).read]
    ]
  }

  get 'sitemap.xml.gz' => proc { |_req|
    [
      200,
      {
        'Pragma' => 'public',
        'Cache-Control' => "max-age=#{7.days.to_i}",
        'Expires' => 1.day.from_now.to_s(:rfc822),
        'Content-Type' => 'text/html'
      },
      [open(Rails.root.join('public', 'sitemaps', 'sitemap.xml.gz')).read]
    ]
  }

  get 'sitemaps/sitemap:number.xml.gz' => proc { |req|
    filename = req['PATH_INFO'].gsub('sitemaps', '').delete('/')

    [
      200,
      {
        'Pragma' => 'public',
        'Cache-Control' => "max-age=#{7.days.to_i}",
        'Expires' => 7.days.from_now.to_s(:rfc822),
        'Content-Type' => 'text/html'
      },
      [open(Rails.root.join('public', 'sitemaps', filename)).read]
    ]
  }

  get '/page/:page_number', to: 'quran#page', as: :quran_page
  get '/juz/:juz_number', to: 'quran#juz', as: :quran_juz
  get '/juz/:juz_number/load_verses', to: 'quran#juz_verses'

  get '/advance_copy/copy_options', to: 'advance_copy#copy_options', as: :advance_copy_options
  get '/advance_copy/copy_text', to: 'advance_copy#copy_text'

  get '/:id/load_verses', to: 'chapters#load_verses'

  get '/:id/referenced_verse', to: 'chapters#referenced_verse'

  # 2-3:5 => 2:3-5
  get '/:chapter-:start::end', to: redirect('/%{chapter}:%{start}-%{end}', status: 301)

  # 2/3:5 => 2:3-5
  get '/:chapter/:start::end', to: redirect('/%{chapter}:%{start}-%{end}', status: 301)

  # /2:2:3 => 1:2-3
  get '/:chapter::start::end', to: redirect('/%{chapter}:%{start}-%{end}', status: 301)

  # /2:2 => /2/2
  # get '/:chapter::verse', to: redirect('/%{chapter}/%{verse}', status: 301)

  # /2/1/1 => /2:1-2
  get '/:chapter/:start/:end', to: redirect('/%{chapter}:%{start}-%{end}', status: 301)

  # 2-3-5 => 2/3-5
  # Can't redirect this format. Surah slug might have - as well
  # get '/:chapter-:start-:end', to: redirect('/%{chapter}/%{start}-%{end}', status: 301)

  get '/:id::range', to: 'chapters#show', as: :key_range
  get '/:id/(:range)', to: 'chapters#show', as: :range
  get '/:id', to: 'chapters#show', as: :chapter

  match '*unmatched_route', to: 'application#not_found', via: :all
end
