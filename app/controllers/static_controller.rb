# frozen_string_literal: true

class StaticController < ApplicationController
  caches_page :opensearch,
              :manifest,
              :msapplication_config,
              :serviceworker

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
