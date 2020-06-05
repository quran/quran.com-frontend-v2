options = if ENV['ELASTICSEARCH_PORT_9200_TCP_ADDR']
            {host: ENV['ELASTICSEARCH_PORT_9200_TCP_ADDR']}
          else
            {}
          end.merge(adapter: :typhoeus)

Elasticsearch::Model.client = Elasticsearch::Client.new options
