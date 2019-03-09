# frozen_string_literal: true

require 'test_helper'

class ChapterInfosControllerTest < ActionDispatch::IntegrationTest
  test 'should get show' do
    get chapter_infos_show_url
    assert_response :success
  end
end
