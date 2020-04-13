# frozen_string_literal: true

class ApiCoreRecord < ActiveRecord::Base
  self.abstract_class = true
  # Maybe read configuration from yml file and initialize the connection here?
  # For now, each app using this gem need to define quran_core configuration in database.yml file.
  # Which is fine atm.
  #self.establish_connection :quran_core

  establish_connection Rails.env.production? ? :quran_core : :quran_core_development
end
