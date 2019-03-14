FROM ruby:2.6.1

RUN apt-get update -qq

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get install -y nodejs
RUN apt-get update && apt-get install -y yarn

ARG env=development

WORKDIR /app
COPY /app /app/app
COPY /bin /app/bin
COPY /config /app/config
COPY /db /app/db
COPY /lib /app/lib
COPY /public /app/public
COPY /spec /app/spec
COPY /config.ru /app/
COPY /Gemfile /app/
COPY /Gemfile.lock /app/
COPY /Rakefile /app/
COPY /gen-sitemaps-and-run.sh /app/gen-sitemaps-and-run.sh
# files could be mounted in dev for realtime code changes without rebuild
# typically that would be: .:/app

# copy build cache for the requested environment only
COPY /build-cache/$env/bundle/ /usr/local/bundle/

RUN mkdir /var/www && \
    chown -R www-data /app /var/www /usr/local/bundle

USER www-data

# install a matching bundler to Gemfile.lock
RUN gem install bundler -v 2.0.1

# install all gems
ARG env=development
ARG bundle_opts=

ENV RAILS_ENV $env
ENV RACK_ENV $env

RUN echo "Running \"bundle install $bundle_opts\" with environment set to \"$env\"..." && \
    bundle install $bundle_opts

EXPOSE 3000

ENTRYPOINT ["bundle", "exec"]
CMD ["./gen-sitemaps-and-run.sh"]
