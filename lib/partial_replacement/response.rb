# frozen_string_literal: true

module PartialReplacement
  # Provides a means of using Turbolinks to perform renders and redirects.
  # The server will respond with a JavaScript call to Turbolinks.visit/replace().
  module Response
    def render(*args, &block)
      render_options = args.extract_options!
      turbolinks, options = _extract_turbolinks_options!(render_options)
      turbolinks = (request.xhr? && !options.empty?) if turbolinks.nil?

      if turbolinks
        response.content_type = Mime[:js]

        render_options = _normalize_render(*args, render_options, &block)
        body = render_to_body(render_options)

        self.status = 200
        self.response_body = "PartialReplacement.replace('#{view_context.j(body)}'#{_turbolinks_js_options(options)});"
      else
        super(*args, render_options, &block)
      end

      response_body
    end

    private

    def _extract_turbolinks_options!(options)
      turbolinks = options.delete(:turbolinks)
      options = options.extract!(:change, :append, :prepend, :replace, :delete, :update_all).delete_if { |_, value| value.nil? }

      [turbolinks, options]
    end

    def _turbolinks_js_options(options)
      js_options = {}

      js_options[:change] = Array(options[:change]) || []
      js_options[:append] = Array(options[:append]) if options[:append]
      js_options[:replace] = Array(options[:replace]) if options[:replace]
      js_options[:prepend] = Array(options[:prepend]) if options[:prepend]
      js_options[:delete] = Array(options[:delete]) if options[:delete]
      js_options[:updateAll] = Array(options[:update_all]) if options[:update_all]

      # js_options[:change] << 'flash_messages' if view_context.flash.present?

      ", #{js_options.to_json}" if js_options.present?
    end
  end
end
