# frozen_string_literal: true

require 'sitemap_generator'

# Set the host name for URL creation
SitemapGenerator::Sitemap.default_host = 'https://quran.com'
SitemapGenerator::Sitemap.sitemaps_host = 'https://quran.com/'
SitemapGenerator::Sitemap.sitemaps_path = 'sitemaps/'

CHANGE_FREQUENCY = 'monthly'

SitemapGenerator::Sitemap.create do
  # Put links creation logic here.
  #
  # The root path '/' and sitemap index file are added automatically for you.
  # Links are added to the Sitemap in the order they are specified.
  #
  # Usage: add(path, options={})
  #        (default options are used if you don't specify)
  #
  # Defaults: :priority => 0.5, :changefreq => 'weekly',
  #           :lastmod => Time.now, :host => default_host
  #
  # Examples:
  #
  # Add '/articles'
  #
  #   add articles_path, :priority => 0.7, :changefreq => 'daily'
  #
  # Add all articles:
  #
  #   Article.find_each do |article|
  #     add article_path(article), :lastmod => article.updated_at
  #   end

  # Add all chapters
  Chapter.find_each do |chapter|
    add "/#{chapter.chapter_number}", priority: 1, changefreq: CHANGE_FREQUENCY

    chapter.slugs.each do |slug|
      add "/#{slug.slug}", priority: 1, changefreq: CHANGE_FREQUENCY
    end

    # Add chapter info for available languages
    ['en', 'ur', 'ml', 'ta'].each do |local|
      add "/surah-info/#{chapter.chapter_number}?locale=#{local}", priority: 1, changefreq: CHANGE_FREQUENCY
    end
  end

  available_translations = ResourceContent.includes(:language).translations.one_verse.approved
  available_tafsirs = ResourceContent.includes(:language).tafsirs.one_verse.approved

  # Add all verses
  Verse.find_each do |verse|
    verse_path = verse.verse_key.tr(':', '/')

    add "/#{verse_path}", priority: 0.8, changefreq: CHANGE_FREQUENCY

    add "/#{verse_path}?font=indopak", priority: 0.8, changefreq: CHANGE_FREQUENCY
    add "/#{verse_path}?font=uthmani", priority: 0.8, changefreq: CHANGE_FREQUENCY

    # Add available translation for each verse
    available_translations.each do |trans|
      add "/#{verse_path}?translations=#{trans.slug || trans.id}", priority: 0.8, changefreq: CHANGE_FREQUENCY
    end

    # Tafsir list
    add "/#{verse_path}/tafsirs", priority: 0.8, changefreq: CHANGE_FREQUENCY

    # Add available tafsirs for each verse
    available_tafsirs.each do |tafsir|
      add "/#{verse_path}/tafsirs/#{tafsir.slug || tafsir.id}", priority: 0.8, changefreq: CHANGE_FREQUENCY
    end
  end

  # Static pages
  %w(about_us donations developers apps).each do |url|
    add "/pages/#{url}", priority: 0.3, changefreq: CHANGE_FREQUENCY
  end

  # Add site locals
  %w(en ar ur id tr fr).each do |local|
    add "/?locale=#{local}", priority: 0.3, changefreq: CHANGE_FREQUENCY
  end

  add '/ayatul-kursi', priority: 1, changefreq: CHANGE_FREQUENCY
  add 'آیت الکرسی/', priority: 1, changefreq: CHANGE_FREQUENCY
end
