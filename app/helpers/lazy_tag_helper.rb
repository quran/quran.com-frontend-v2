# frozen_string_literal: true

module LazyTagHelper
  DEFAULT_IMG_DATA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

  def lazy_image_tag(name, **options)
    options[:data] = options[:data] || {}
    options[:data] =  options[:data].merge({ src: asset_path(name) })
    options[:class] = "#{options[:class]} lazyload"
    image_tag DEFAULT_IMG_DATA, options
  end

  def loading_spinner
    "<span class='spinner text text--grey'><i class='spinner--swirl'></i></span>".html_safe
  end
end
