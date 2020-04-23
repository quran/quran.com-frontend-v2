FROM ruby:2.6.2-alpine

RUN apk add --no-cache curl postgresql-dev tzdata git make gcc g++ python linux-headers binutils-gold gnupg libstdc++ yarn

ENV RAILS_ROOT /var/www/quran
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

# Setting env up
ENV RAILS_ENV='production'
ENV RACK_ENV='production'

# Adding gems
RUN gem install bundler
COPY Gemfile Gemfile
COPY Gemfile.lock Gemfile.lock
RUN bundle install --jobs 20 --retry 5 --without development test
COPY /gen-sitemaps-and-run.sh /app/gen-sitemaps-and-run.sh

# Adding project files
COPY . .
#RUN bundle exec rake assets:precompile

#running this stops assets from compiling - but perhaps in the future
#can remove some of these for a slightly smaller image.
#RUN apk del curl git make gcc g++ python linux-headers binutils-gold gnupg

run /app/gen-sitemaps-and-run.sh

EXPOSE 3000
CMD ["bundle", "exec", "puma", "--early-hints", "-C", "config/puma.rb"]
