const { environment } = require("@rails/webpacker");
const erb = require("./loaders/erb");
const webpack = require("webpack");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// resolve-url-loader must be used before sass-loader
environment.loaders.get("sass").use.splice(-1, 0, {
  loader: "resolve-url-loader"
});

const sassLoader = environment.loaders.get("sass");
const sassLoaderConfig = sassLoader.use.find(function(element) {
  return element.loader == "sass-loader";
});

// Use Dart-implementation of Sass (default is node-sass)
const options = sassLoaderConfig.options;
options.implementation = require("sass");

// Configure PurgeCSS
const PurgecssPlugin = require("purgecss-webpack-plugin");

const fs = require("fs");
//const glob = require("glob-all");
const path = require("path");

var whitelist_path = "config/whitelist.json";
var whitelist = [];

if (fs.existsSync(whitelist_path)) {
  whitelist = JSON.parse(fs.readFileSync(whitelist_path));
}

// Enable the default config
// environment.splitChunks()

//environment.plugins.append(
//  "PurgecssPlugin",
//  new PurgecssPlugin({
//    paths: glob.sync([
//      path.join(__dirname, "../../app/javascript/**/*.js"),
//      path.join(__dirname, "../../app/views/**/*.erb")
//    ])
//  })
//);

environment.loaders.append("expose", {
  test: require.resolve("jquery"),
  use: [
    {
      loader: "expose-loader",
      options: "$"
    }
  ]
});

environment.plugins.prepend(
  "Provide",
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery",
    jquery: "jquery",
    "window.jQuery": "jquery",
    Popper: ["popper.js", "default"]
  })
);

environment.loaders.prepend("erb", erb);
module.exports = environment;
