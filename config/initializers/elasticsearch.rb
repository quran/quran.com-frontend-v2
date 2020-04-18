options = if ENV['ELASTICSEARCH_HOST']
            {host: ENV['ELASTICSEARCH_HOST']}
          else
            {host: 'staging.quran.com:32772'}
          end.merge(adapter: :typhoeus)

Elasticsearch::Model.client = Elasticsearch::Client.new options
