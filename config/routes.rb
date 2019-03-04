Rails.application.routes.draw do
=begin
  /002 => /2
  /002/002 => /2/2
  /02:02 => /2:2
  /2/20-2 => 2/2-20
  /2:20:2 => /2/2-20
  /120 => invalid-surah
   /1/8 => invalid ayah
=end

  # /2:2:3 => 1/2-3
  get '/:chapter::start::end', to: redirect('/%{chapter}/%{start}-%{end}', status: 302)

  # /2:2 => /2/2
  get '/:chapter::verse', to: redirect('/%{chapter}/%{verse}', status: 302)

  # /2-2 => 1/2
  get '/:chapter-:verse', to: redirect('/%{chapter}/%{verse}', status: 302)

  # /2-2-3 => 1/2-3
  get '/:chapter-:start-:end', to: redirect('/%{chapter}/%{start}-%{end}', status: 302)

  # /2/1/1 => /2/1-2
  get '/:chapter/:start/:end', to: redirect('/%{chapter}/%{start}-%{end}', status: 302)

  get '/:id', to: 'chapters#show', as: :chapter
  get '/:id/:range', to: 'chapters#show', as: :range

  get :search, to: 'search#search', as: :search

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
end
