require "action_controller/caching/pages"

Rails.configuration.to_prepare do
  ActionController::Caching::Pages::PageCache.class_eval do
    private

    def delete(path)
      return unless path
      Rails.cache.delete(path)
    end

    def write(content, path, gzip)
      return unless path
      Rails.cache.write(path, content, raw: true)
    end
  end
end
