# frozen_string_literal: true

module PagesHelper
  def group_ayah_by_lines(verses)
    #  Group words by page then by line number,
    # and return words with following schema
    # lines = {
    #     page: [
    #         line: {
    #             verse_number: {
    #                 index: verse_index,
    #                 verse_number: verse_number,
    #                 words: [list, of, words]
    #             }
    #         }
    #     ]
    # }

    lines = {}

    verses.each_with_index do |verse, i|
      verse.words.each do |w|
        lines[w.line_number] ||= {}

        lines[w.line_number][verse.id] ||= {
            index: i,
            verse_number: verse.verse_number,
            words: []
        }

        lines[w.line_number][verse.id][:words] << w
      end
    end

    lines
  end

  def group_verse_by_page_and_lines(verses)
    #  Group words by page then by line number,
    # and return words with following schema
    # lines = {
    #     page: [
    #         line: {
    #             verse_number: {
    #                 index: verse_index,
    #                 verse_number: verse_number,
    #                 words: [list, of, words]
    #             }
    #         }
    #     ]
    # }

    lines = {}
    index = 0
    verses.group_by(&:page_number).each do |page, page_verses|
      lines[page] = {

      }

      page_verses.each do |verse, i|
        verse.words.each do |w|
          lines[page][w.line_number] ||= {}

          lines[page][w.line_number][verse.verse_number] ||= {
              index: index ,
              verse_number: verse.verse_number,
              words: []
          }

          lines[page][w.line_number][verse.verse_number][:words] << w
        end
        index += 1
      end
    end

    lines
  end
end
