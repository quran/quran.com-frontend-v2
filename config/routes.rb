# frozen_string_literal: true

Rails.application.routes.draw do
  resources :chapter_info, only: :show
  resources :foot_note, only: :show

  get :search, to: 'search#search', as: :search
  get '/audio', to: 'audio_files#index'
  get '/ayatul-kursi', to: 'chapters#show', id: '2', range: '255'

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
