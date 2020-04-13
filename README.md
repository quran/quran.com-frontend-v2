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
    <img src="app/javascript/images/icons/android-chrome-256x256.png" alt="Logo" width="80" height="80">
  </a>

  <h1 align="center">The Noble Quran</h1>

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
- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Getting Started](#getting-started)
  - [Development Stack](#development-stack)
  - [Prerequisites](#prerequisites)
  - [Set-Up](#set-up)
- [Contribute](#contribute)
- [Important Note](#important-note)
- [License](#license)
- [Contact](#contact)

<!-- ABOUT THE PROJECT -->

## About The Project

<a href="https://quran.com">
<img src="app/javascript/images/thumbnail.png" alt="Quran.com Thumbnail">
</a>

Ma Sha'a Allah and Tabarak Al Rahman, ["The Noble Quran"](https://quran.com) application serves millions of visitors from all around the world. Al-hamdu Lillah, the project continues to grow.

This success is _only_ with the blessings of **Allah** Subhana Wa Tala. We're also thankful for the dedicated professionals who volunteer diligently to keep this project beneficial.

Continue reading to learn more about how you can contribute to ["the Noble Quran GitHub repository"](https://github.com/quran/quran.com-frontend-v2). Your help will surely go a long way, In Sha'a Allah.

<!-- GETTING STARTED -->

## Getting Started

The second version of ["the Noble Quran"](https://quran.com) application is developed using Ruby on Rails. Ruby is an interpreted, high-level, general-purpose programming language. Rails, is a server-side web application and a model–view–controller framework. The Rails framework is written in the Ruby programming language, and it provides default structures for a database, web service, and web pages. For more information about Ruby on Rails, see the [Ruby on Rails Guide](https://guides.rubyonrails.org/).

### Development Stack

Our stack:

- [Ruby](https://www.ruby-lang.org/en/)
- [Rails](https://rubyonrails.org/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Rails Webpacker](https://github.com/rails/webpacker)

Our team would like to keep development libraries up to date. Please refer to the _package.json_ file for the versions of the project dependences. To start contributing, you'll first need to install the prerequisites and set up a local Git repository, as outlined in the next sections.

### Prerequisites

You'll need:

- [Git](https://git-scm.com/downloads) for source code version control. If you want, you may use another Version Control Software, such as SVN.
- [Node.js](https://nodejs.org/en/), a JavaScript runtime environment that executes JavaScript code outside of a browser
- [Yarn](https://yarnpkg.com/en/) stands for "Yet Another Resource Negotiator", it's an Apache Hadoop technology
- Follow [this guide](https://gorails.com/setup) to install [Ruby, Rails & and PostgreSQL](https://gorails.com/setup) together. Select Ruby version `2.6.2`
- [pgAdmin](https://www.pgadmin.org/) is a GUI for PostgreSQL
- You're strongly encouraged to install Ruby with _Ruby Version Manager_ (RVM). [RVM](https://rvm.io/) is a command-line tool that lets you easily install and manage multiple Ruby environments.

### Set-Up

The setup instructions assume that you're using [Git Bash](https://git-scm.com/), but the concepts are the same if you're using [Git GUI](https://git-scm.com/downloads/guis) or another version control software.

1. To begin, fork the current ["Noble Quran project repository"](https://github.com/quran/quran.com-frontend-v2) on GitHub.

2. Clone the repository of your fork. Launch your terminal, and enter the following command:

  ```sh
  git clone https://github.com/<your-username>/quran.com-frontend-v2.git
  ```

  Replace `<your-username>` with your GitHub user name.

3. Move into the `quran.com-frontend-v2` directory with the following command:

  ```sh
  cd quran.com-frontend-v2
  ```

4. Assign the forked repository to a remote called "origin".

  ```sh
  git remote add origin git://github.com:<your-username>/quran.com-frontend-v2.git
  ```

5. Assign the original repository to a remote called "upstream".

  ```sh
  git remote add upstream git@github.com:quran/quran.com-frontend-v2.git
  ```

6. Install the frontend packages with yarn:

  ```sh
  yarn
  ```

7. Install the Ruby bundles with the following series of commands:

  ```sh
  rvm gemset create quran
  rvm gemset use quran
  gem install bundler
  bundle install
  ```

8. Download the [mini database dump](https://drive.google.com/drive/folders/1tkm0nYVTZaOYSbFcSJIc6Lq1rM-PIUBy). This dump has the first 15 Ayahs of each surah, for all the Surahs, along with two translations, two audio recitations, and other required data.

9. Check that PostgreSQL is up and running on your machine. For Linux, use:

10. Download the [mini database dump](https://drive.google.com/drive/folders/1tkm0nYVTZaOYSbFcSJIc6Lq1rM-PIUBy). This dump has the first 15 Ayahs of each surah, for all the Surahs, along with two translations, two audio recitations, and a other required data.

11. Inside the `quran.com-fronted-v2` directory, run:

  ```sh
  bundle exec rails db:create
  ```

12. Load the dump in the PostgreSQL database. This process may vary for different operating systems. For Linux, use:

  ```sh
  psql -cxq --quiet -d quran_dev -f dump.sql
  ```

13. To start the local server with Rails, run:

  ```sh
  rails s
  ```

In Sha'a Allah, after going through these successfully, you'll see the web application running on `localhost:3000`

If you're new to Git, see the [Git references](https://git-scm.com/docs) and the [Git training kit](https://github.github.com/training-kit) to learn more about the Git commands.

<!-- CONTRIBUTING -->

## Contribute

- Review the [open issues](https://github.com/quran/quran.com-frontend-v2/issues) for a list of known issues and proposed features.

- Pull the latest changes from "upstream" and push these changes to your forked "origin". You'll need to repeat this step each time you plan to contribute.

  ```sh
  git checkout master
  git fetch upstream
  git rebase upstream/master
  git push -f origin master
  ```

- Make a branch for your feature or fix. It's a good practice to make a separate branch for each feature or fix.

  ```sh
  git checkout -b branchName
  ```

- Employ your technical chops to resolve an issue or develop a proposed feature. Be sure your code follows our practices, as observed in our source code.

- Run the following commands before you switch from your current branch to a new branch, to prevent leaking the changes on your current branch to another branch. The `git status` commands shows you the modified files, and `git add .` adds all the changed files to the staging area. The`git commit` command moves the files from the staging area and makes a commit in the branch. Only the committed changes can be pushed.

  ```sh
  git status
  git add .
  git commit -m "this is a commit"
  ```

- When you're done making changes, push your branch to the "origin". The `-u` flag links this branch with the remote branch, so that in the future you can simply type `git push origin`.

  ```sh
  git push -u origin branchName
  ```

- Navigate to the  ["Noble Quran project repository"](https://github.com/quran/quran.com-frontend-v2) on GitHub. Click on the "Pull Request" button in the project header. Enter a title and description of your pull request, and click on the green "Send pull request" button.

- Your code will be reviewed. You can also continue to push to your branch in light of discussion and feedback about your commits.

Contributions are what make the open source community an amazing place to learn, inspire, and develop together. The contributions you make are _appreciated_.

<!-- IMPORTANT NOTE -->

## Important Note

This project is for the sake of Allah Subhana Wa Tala, and our team has good intentions while working on this project. When using our project code or contributing to the project, you agree to abide by the Quran and the Sunnah.

You are not allowed to use or copy the project code for any material gains or improper use.

<!-- LICENSE -->

## License

Distributed under the GNU GPLv3 License. See [LICENSE](./LICENSE) for more information.

<!-- CONTACT -->

## Contact

Please [open an issue](https://github.com/quran/quran.com-frontend/issues/new) with your email to join our Slack channel, and we'll try to add you as soon as possible.

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
