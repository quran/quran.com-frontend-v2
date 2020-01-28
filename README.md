<!--
*** Thanks for checking out this Quran.com repo. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://quran.com">
    <img src="app/assets/images/icons/android-chrome-256x256.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">The Noble Quran</h3>

  <p align="center">
    The source code for the Quran.com website.
    <br />
    <a href="#contact"><strong>Join Slack Channel »</strong></a>
    <br />
    <br />
    <a href="https://quran.com">View Site</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-v2/issues">Report Bug</a>
    ·
    <a href="https://github.com/quran/quran.com-frontend-v2/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
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

["The Noble Quran"](https://quran.com) project has served millions of visitors from all corners of the world - and we continue to grow everyday.

This, with the blessing of Allah, is powered by a handful of volunteers who are working hard on their spare time to keep this project as beneficial and useful to people all around the world. Any help or contribution of yours will surely go a long way.

### Built With

The tech stack for this project:

- [Ruby](https://www.ruby-lang.org/en/)
- [Rails](https://rubyonrails.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Coffeescript](https://coffeescript.org/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running please follow these simple steps.

### Prerequisites

- [Make sure Node.js is installed](https://nodejs.org/en/)
- [Make sure Yarn is installed](https://yarnpkg.com/en/)
- [Follow this guide install Ruby, Rails & and PostgreSQL](https://gorails.com/setup) (select your OS from the options). Please try to install ruby with rvm, otherwise there might be problems later on.
- Make sure you install ruby version `2.6.2`; you can update later on.
- Install [pgAdmin](https://www.pgadmin.org/), a GUI for postgreSQL. (You can do this later on).

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
