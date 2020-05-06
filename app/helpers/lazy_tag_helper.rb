module LazyTagHelper
  DEFAULT_IMG_DATA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

  def lazy_image_tag(name, **options)
    options[:class] = "#{options[:class]} lazyload"
    options[:data] =  { src: resolve_path_to_image(name) }

    image_tag DEFAULT_IMG_DATA, options
  end
end
