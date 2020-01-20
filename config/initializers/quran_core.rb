# frozen_string_literal: true

require 'quran_core'

class ApiCoreRecord < ApplicationRecord
  establish_connection Rails.env.production? ? :quran_core : :quran_core_development
end
