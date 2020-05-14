# frozen_string_literal: true

module PagesHelper
  def group_ayah_by_lines(verses)
    #      This method group words ayah by line number, and return words with following schema
    #      {
    #       page_number1: [
    #        {verse_number: [words]}
    #      ],
    #
    #      page_number2: [
    #
    #      ]
    #      }

    lines = {}

    # verses.map(&:words).flatten.group_by(&:line_number)

    verses.each do |verse|
      verse.words.each do |w|
        lines[w.line_number] ||= {}
        lines[w.line_number][verse.verse_number] ||= []

        lines[w.line_number][verse.verse_number] << w
      end
    end

    lines
  end
end
