FROM ruby:2.7

WORKDIR /home/app

COPY Gemfile* ./

RUN bundle install

COPY . .

# (기존 중략)
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000"]