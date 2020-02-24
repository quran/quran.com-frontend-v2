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
[![Issues][issues-shield]][issues-url]
[![Stargazers][stars-shield]][stars-url]
[![MIT License][license-shield]][license-url]

<!-- TABLE OF CONTENTS -->

## Table of Contents
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Development Stack](#development-stack)
  - [Prerequisites](#prerequisites)
  - [Set-up](#set-up)
- [Contribute](#contribute)
- [License](#license)
- [Contact](#contact)
- [End Note:](#end-note)

<!-- ABOUT THE PROJECT -->

## About The Project

<a href="https://quran.com">
<img src="./app/assets/images/thumbnail.png" alt="Quran.com Thumbnail">
</a>

Ma Sha'a Allah and Tabarak Al Rahman, ["The Noble Quran"](https://quran.com) project serves millions of visitors from all around the world. And, al-hamdu Lillaah, the project continues to grow.

This success is _only_ with the blessings of **Allah** Subhana Wa Tala. We're also thankful for the dedicated professionals who volunteer diligently to keep this project beneficial.

Continue reading to learn more on how you can contribute to ["the Noble Quran"](https://quran.com). Any help or contribution of yours will surely go a long way, In Sha'a Allah.

<!-- GETTING STARTED -->

## Getting Started

The second version of ["the Noble Quran"](https://quran.com) project is developed with Ruby on Rails. Ruby is an interpreted, high-level, general-purpose programming language. Rails, is a server-side web application and a model–view–controller framework. The Rails framework is written in the Ruby programming language, and it providing default structures for a database, web service, and web pages.

To contribute, you'll first need to installing prerequisites and set up a local Git repository.

### Development Stack

Our stack:

- [Ruby](https://www.ruby-lang.org/en/)
- [Rails](https://rubyonrails.org/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Rails Webpacker](https://github.com/rails/webpacker)

Our team would like to keep development libraries up to date. Please refer to the _packages.json_ file for the versions of the project dependences.

### Prerequisites

Please install the following:

- [Node.js](https://nodejs.org/en/), a JavaScript runtime environment that executes JavaScript code outside of a browser.
- [Yarn](https://yarnpkg.com/en/) stands for "Yet Another Resource Negotiator", it is an Apache Hadoop technology.
- Follow (this guide)[https://gorails.com/setup] to install [Ruby, Rails & and PostgreSQL](https://gorails.com/setup) together. Select ruby version `2.6.2`.
- [pgAdmin](https://www.pgadmin.org/) is a GUI for postgreSQL.
- Also, you're strongly encouraged to install ruby with _Ruby Version Manager_ (RVM). (RVM)[https://rvm.io/] is a command-line tool that lets you easily install and manage multiple ruby environments.

### Set-up

The setup instructions assume that you're using [Git Bash](https://git-scm.com/).

1. To begin, fork the ["the Noble Quran"](https://quran.com) project.

1. Clone the repository of your fork. Launch Git Bash, and use the following command. Replace `<your-username>` with your GitHub user name:

```sh
git clone https://github.com/<your-username>/quran.com-frontend-v2.git
```
2. Move into the `quran.com-frontend-v2` directory with the following command:

```sh
cd quran.com-frontend-v2
```

1. Assign the forked repository to a remote called "origin".

```sh
git remote add origin git://github.com/<your-username>/quran.com-frontend-v2.git
```

1. Assign the original repository to a remote called "upstream".

```sh
git remote add upstream https://github.com/quran/quran.com-frontend-v2
```

3. Install frontend packages with yarn:

```sh
yarn
```

4. Install the ruby bundles with the following series of commands:

```sh
rvm gemset create quran
rvm gemset use quran
gem install bundler
bundle install
```

5. [Contact us](#contact) about the database dump.

6. Check that postgreSQL is up and running on your machine. For Linux, use:

```sh
sudo service postgresql status
```

7. Load the dump in the postgreSQL database. This process may vary for different operating systems. For Linux, use:

```sh
psql -cxq --quiet -d quran_dev -f dump.sql
```

8. Inside the `quran.com-fronted-v2` directory, run:

```sh
rake db:create
```

9. To start the local server with rails, run:

```sh
rails s
```

In Sha'a Allah, after properly going through these, you'll see the web application running on `localhost:3000`

<!-- CONTRIBUTING -->

## Contribute

- Review the [open issues](https://github.com/quran/quran.com-frontend-v2/issues) for a list of known issues and proposed features

- Pull the latest changes from "upstream" and push these changes to your forked "origin". This syncs your fork of the repository with the live upstream repository.

```sh
git pull upstream master
git push origin master
```

- Make a branch for your feature or fix. It's a good practice to make a separate branch for each feature or fix.

```sh
git checkout -b branchName
```

- Employ your technical chops to resolve an issue or develop a proposed feature. Be sure your code follows our practices.

- Push your branch to the origin. The following command will create a branch on your GitHub project. The `-u` flag links this branch with the remote branch, so that in the future you can simply type `git push origin`.

```sh
git push -u origin branchName
```

- Navigate to the ["the Noble Quran"](https://quran.com) project. Click on the "Pull Request" button in the project header. Enter a title and description of your pull request, and click on the green "Send pull request" button.

- Then, you'll see an open pull request. Your code will be reviewed, and you can discuss with the team. You can also continue to push to your branch in light of discussion and feedback about your commits.

Contributions are what make the open source community an amazing place to learn, inspire, and develop together. The contributions you make are _appreciated_.

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
