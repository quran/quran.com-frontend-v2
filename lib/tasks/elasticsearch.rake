# frozen_string_literal: true

namespace :elasticsearch do

  desc 'deletes all elasticsearch indices'
  task delete_indices: :environment do
    QuranUtils::ContentIndex.remove_indexes rescue nil

    begin
      Verse.__elasticsearch__.delete_index!
    rescue Elasticsearch::Transport::Transport::Errors::NotFound => e
    end

    begin
      [Chapter, Juz, MuhsafPage].each do |model|
        model.__elasticsearch__.delete_index!
      end
    rescue Elasticsearch::Transport::Transport::Errors::NotFound => e
    end

    puts "Done"
  end

  desc 'reindex elasticsearch'
  task re_index: :environment do
    require 'parallel'

    Verse.__elasticsearch__.create_index!
    [Chapter, Juz, MuhsafPage].each do |model|
      model.__elasticsearch__.create_index!
    end
    QuranUtils::ContentIndex.setup_indexes

    ActiveRecord::Base.logger.silence do
      Parallel.each([MuhsafPage, Chapter, Juz], in_processes: 3, progress: "Indexing chapters and juz data") do |model|
        model.import(force: true)
      end

      verses = Verse.all
      Parallel.each(verses, in_processes: 3, progress: "Indexing verses") do |verse|
        verse.__elasticsearch__.index_document
      end

      puts "Importing translations"
      QuranUtils::ContentIndex.import
    end

    puts "Done #{Verse.__elasticsearch__.refresh_index!}"
  end
end
