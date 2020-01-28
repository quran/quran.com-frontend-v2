# frozen_string_literal: true

require 'quran_core'

class ApiCoreRecord < ActiveRecord::Base
  establish_connection Rails.env.production? ? :quran_core : :quran_core_development
end
