Rails.application.routes.draw do
  get :search, to: 'search#search', as: :search

  namespace :pages do
    get :about_us
    get :apps
    get :donations
    get :help_and_feedback
    get :developers
  end

  root to: 'pages#donations'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  namespace :static do
    get :opensearch
    get :manifest
    get :msapplication_config
  end
end
