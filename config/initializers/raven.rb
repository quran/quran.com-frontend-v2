Raven.configure do |config|
  # https://sentry.io/organizations/quran-v2/issues/?project=2802394
  config.dsn = ENV['SENTRY_DSN']

  config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
  config.environments = %w[staging production]

  config.excluded_exceptions +=[
      ActionController::BadRequest,
      ActionController::UnknownFormat
  ]
end
