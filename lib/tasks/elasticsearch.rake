# frozen_string_literal: true

namespace :elasticsearch do

  desc 'deletes all elasticsearch indices'
  task delete_indices: :environment do
    Verse.__elasticsearch__.delete_index!
    Chapter.__elasticsearch__.delete_index!

    puts "Done"
  end

  desc 'reindex elasticsearch'
  task re_index: :environment do
    Verse.__elasticsearch__.create_index!
    Chapter.__elasticsearch__.create_index!

    require 'parallel'

    ActiveRecord::Base.logger.silence do
      Parallel.each([Chapter, Juz], in_processes: 2, progress: "Indexing chapters and juz data") do |model|
        model.import
      end

      verses = Verse.includes(:words)
      Parallel.each(verses, in_processes: 2, progress: "Indexing verses") do |verse|
        verse.__elasticsearch__.index_document
      end
    end

    puts "Done #{Verse.__elasticsearch__.refresh_index!}"
  end
end


