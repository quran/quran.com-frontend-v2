=begin
options = if ENV['ELASTICSEARCH_HOST']
            {host: ENV['ELASTICSEARCH_HOST']}
          else
            {
                host: 'staging.quran.com',
                port: 32785,
                adapter: :typhoeus,
                scheme: :http

            }
          end

Elasticsearch::Model.client = Elasticsearch::Client.new(options)
=end
