# frozen_string_literal: true

Rails.application.routes.draw do
  # surah in url for seo
  get '/surah/:id/info', to: 'chapter_info#show'
  get '/surah-info/:id', to: 'chapter_info#show'
  get '/:id/tafsirs', to: 'verses#select_tafsirs', as: :verse_tafsirs
  get '/:id/tafsirs/:tafsir_id', to: 'verses#tafsir', as: :verse_tafsir

  resources :chapter_info, only: :show
  resources :foot_note, only: :show

  get :search, to: 'search#search', as: :search
  get 'search/suggestion', to: 'search#suggestion'

  get '/audio', to: 'audio_files#index'
  get '/ayatul-kursi', to: 'chapters#ayatul_kursi', id: '2', range: '255'
  get "آیت الکرسی/", to: 'chapters#ayatul_kursi', id: '2', range: '255'

  resources :verses, only: :show do
    member do
      get :share
      get :select_tafsirs
      get :tafsir
    end
  end

  namespace :pages do
    get :about_us
    get :apps
    get :donations
    get :help_and_feedback
    get :developers
  end

  root to: 'chapters#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  namespace :static do
    get :opensearch
    get :manifest
    get :msapplication_config
  end

  get :sw, to: 'static#serviceworker'
  get :serviceworker, to: 'static#serviceworker'

  get "/sitemap.xml.gz" => proc { |req|
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

  get "sitemap.xml.gz" => proc { |req|
    [
        200,
        {
            'Pragma' => 'public',
            'Cache-Control' => "max-age=#{7.days.to_i}",
            'Expires' => 1.days.from_now.to_s(:rfc822),
            'Content-Type' => 'text/html'
        },
        [open(Rails.root.join('public', 'sitemaps', 'sitemap.xml.gz')).read]
    ]
  }


  get "sitemaps/sitemap:number.xml.gz" => proc { |req|
    filename = req['PATH_INFO'].gsub('sitemaps', '').gsub(/\//, '')

    [
        200,
        {
            'Pragma' => 'public',
            'Cache-Control' => "max-age=#{7.day.to_i}",
            'Expires' => 7.days.from_now.to_s(:rfc822),
            'Content-Type' => 'text/html'
        },
        [open(Rails.root.join('public', 'sitemaps', filename)).read]
    ]
  }

  get '/:id/load_verses', to: 'chapters#load_verses'

  # /2:2:3 => 1/2-3
  get '/:chapter::start::end', to: redirect('/%{chapter}/%{start}-%{end}', status: 301)

  # /2:2 => /2/2
  get '/:chapter::verse', to: redirect('/%{chapter}/%{verse}', status: 301)

  # /2/1/1 => /2/1-2
  get '/:chapter/:start/:end', to: redirect('/%{chapter}/%{start}-%{end}', status: 301)

  get '/:id', to: 'chapters#show', as: :chapter
  get '/:id/(:range)', to: 'chapters#show', as: :range
end
