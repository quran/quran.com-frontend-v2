module LazyTagHelper
  DEFAULT_IMG_DATA = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

  def lazy_image_tag(name, **options)
    image_tag DEFAULT_IMG_DATA, class: "#{options[:class]} lazyload", data: { src: resolve_path_to_image(name) }
  end
end
