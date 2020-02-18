<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://quran.com">
    <img src="app/assets/images/icons/android-chrome-256x256.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">The Noble Quran</h3>

  <p align="center">
    The official source code repository for Quran.com
    <br />
    <a href="#contact"><strong>Join the Slack Channel »</strong></a>
    <br />
    <br />
    <a href="https://quran.com">Visit Quran.com</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-v2/issues">Report Bug</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-v2/issues">Request Feature</a>
  </p>
</p>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->

## Table of Contents
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Development Stack](#development-stack)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [End Note:](#end-note)

<!-- ABOUT THE PROJECT -->

## About The Project

<a href="https://quran.com">
<img src="./app/assets/images/thumbnail.png" alt="Quran.com Thumbnail">
</a>

Ma Sha'a Allah and Tabarak Al Rahman, ["The Noble Quran"](https://quran.com) project serves millions of visitors from all around the world. And, al-hamdu Lillaah, the project continues to grow.

This success is only with the blessings of Allah, and we're thankful for the dedicated volunteers who work diligently to keep this project as beneficial and useful.

Continue reading to learn more on how you can contribute to ["the Noble Quran"](https://quran.com). Any help or contribution of yours will surely go a long way, In Sha'a Allah.

<!-- GETTING STARTED -->

## Getting Started

Version 2 of ["the Noble Quran"](https://quran.com) project is developed with Ruby on Rails. Ruby is an interpreted, high-level, general-purpose programming language. Rails, is a server-side web application and a model–view–controller framework. The Rails framework is written in the Ruby programming language, and it providing default structures for a database, a web service, and web pages.

To contribute, you'll first need to set up your developed environment by installing prerequisites. And, you'll need to sync a local copy of ["the Noble Quran"](https://quran.com) repository to your machine.

### Development Stack

Our tech stack:

- [Ruby 2.6.2](https://www.ruby-lang.org/en/)
- [Rails 6.0.2.1](https://rubyonrails.org/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Rails Webpacker](https://github.com/rails/webpacker)

### Prerequisites

Please install the following

- [Node.js](https://nodejs.org/en/), a JavaScript runtime environment that executes JavaScript code outside of a browser.
- [Yarn](https://yarnpkg.com/en/) stands for "Yet Another Resource Negotiator", it is an Apache Hadoop technology.
- Follow (this guide)[https://gorails.com/setup] to install [Ruby, Rails & and PostgreSQL](https://gorails.com/setup) together. Select ruby version `2.6.2`. 
- [pgAdmin](https://www.pgadmin.org/) is a GUI for postgreSQL.
- You're strongly encouraged to install ruby with **Ruby Version Manager (RVM)**. (RVM)[https://rvm.io/] is a command-line tool that allows you to easily install and manage multiple ruby environments.

### Installation

1. Clone the repo

```sh
git clone https://github.com/quran/quran.com-frontend-v2.git
```

2. Move into quran.com-frontend-v2 with `cd quran.com-frontend-v2`

3. Install frontend packages with yarn

```sh
yarn
```

4. Install the ruby bundles with this series of commands

```sh
rvm gemset create quran
rvm gemset use quran
gem install bundler
bundle install
```

5. [Contact us](#contact) to get the database dump.

6. Make sure postgreSQL is up and running (this command is for Linux, this might differ on other OSes)

```sh
sudo service postgresql status
```

7. Load dump in database (the process might vary based on OS)

```sh
psql -cxq --quiet -d quran_dev -f dump.sql
```

8. Run `rake db:create` inside `quran.com-fronted-v2` directory

9. Run `rails s` to start the local server with rails.

Inshallah, after going through these steps properly you should see the web app running on localhost:3000

<!-- ROADMAP -->

## Roadmap

See the [open issues](https://github.com/quran/quran.com-frontend-v2/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**. Please go through the brief [contribution guidelines](./.github/CONTRIBUTING.md) to learn how to contribute to this project.

<!-- LICENSE -->

## License

Distributed under the GNU GPLv3 License. See [LICENSE](./LICENSE) for more information.

<!-- CONTACT -->

## Contact

Please [open an issue](https://github.com/quran/quran.com-frontend/issues/new) with your email to join our slack channel where we can discuss ideas, issues, features and so much more. We will try to add you as soon as possible.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/quran/quran.com-frontend-v2?style=for-the-badge
[contributors-url]: https://github.com/quran/quran.com-frontend-v2/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/quran/quran.com-frontend-v2?style=for-the-badge
[forks-url]: https://github.com/quran/quran.com-frontend-v2/network/members
[stars-shield]: https://img.shields.io/github/stars/quran/quran.com-frontend-v2?style=for-the-badge
[stars-url]: https://github.com/quran/quran.com-frontend-v2/stargazers
[issues-shield]: https://img.shields.io/github/issues/quran/quran.com-frontend-v2?style=for-the-badge
[issues-url]: https://github.com/quran/quran.com-frontend-v2/issues
[license-shield]: https://img.shields.io/github/license/quran/quran.com-frontend-v2?style=for-the-badge
[license-url]: https://github.com/quran/quran.com-frontend-v2/blob/master/LICENSE.txt
[product-screenshot]: images/screenshot.png

## End Note:

This project is for the sake of Allah and we all have good intentions while working with this project. But we must stress that copying the code/project unethically or using this for any material gains is unacceptable.
<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->
