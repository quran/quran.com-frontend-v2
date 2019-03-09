# frozen_string_literal: true

require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest
  test 'should get about_us' do
    get pages_about_us_url
    assert_response :success
  end

  test 'should get apps' do
    get pages_apps_url
    assert_response :success
  end

  test 'should get donations' do
    get pages_donations_url
    assert_response :success
  end

  test 'should get help_and_feedback' do
    get pages_help_and_feedback_url
    assert_response :success
  end

  test 'should get developers' do
    get pages_developers_url
    assert_response :success
  end
end
