module Slugable
  extend ActiveSupport::Concern

  included do
    has_many :slugs

    def self.find_using_slug(slug)
      if slug.to_s[/\d+/] == slug.to_s
        self.where(id: slug).first
      else
        joins(:slugs).where('slugs.slug': slug).first
      end
    end
  end
end
