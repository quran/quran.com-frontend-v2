# frozen_string_literal: true

require 'quran_core'

class ApiCoreRecord < ActiveRecord::Base
  self.establish_connection Rails.env.production? ? :quran_core : :quran_core_development
end
