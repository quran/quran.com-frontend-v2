module LazyTagHelper
  DEFAULT_IMG_DATA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

  def lazy_image_tag(name, **options)
    options[:data]  = options[:data] ? options[:data] : {}
    options[:data] =  options[:data].merge({ src: resolve_path_to_image(name)  })
    options[:class] = "#{options[:class]} lazyload"
    image_tag DEFAULT_IMG_DATA, options
  end
end
