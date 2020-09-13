options = if ENV['ELASTICSEARCH_PORT_9200_TCP_ADDR']
            {host: ENV['ELASTICSEARCH_PORT_9200_TCP_ADDR']}
          else
            {
              host: '172.17.0.7'
            }
          end.merge(adapter: :typhoeus)

Elasticsearch::Model.client = Elasticsearch::Client.new options
