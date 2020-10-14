# frozen_string_literal: true

class StaticController < ApplicationController
  skip_before_action :verify_authenticity_token, only: :serviceworker

  caches_page :opensearch,
              :manifest,
              :msapplication_config

  def opensearch
    render formats: :xml
  end

  def manifest
    render formats: :json
  end

  def msapplication_config
    render formats: :xml
  end

  def serviceworker
    render formats: :js
  end
end
