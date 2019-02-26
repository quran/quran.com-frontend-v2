class StaticController < ApplicationController
  def opensearch
    render formats: :xml
  end

  def manifest
    render formats: :json
  end

  def msapplication_config
    render formats: :xml
  end
end
