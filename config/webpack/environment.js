const { environment } = require("@rails/webpacker");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Configure PurgeCSS
const PurgecssPlugin = require("purgecss-webpack-plugin");
const fs = require("fs");
const glob = require("glob-all");
const path = require("path");

var whitelist_path = "config/whitelist.json";
var whitelist = [];

if (fs.existsSync(whitelist_path)) {
  whitelist = JSON.parse(fs.readFileSync(whitelist_path));
}

// Enable the default config
// environment.splitChunks()

environment.plugins.append(
  "PurgecssPlugin",
  new PurgecssPlugin({
    paths: glob.sync([
      path.join(__dirname, "../../app/javascript/**/*.js"),
      path.join(__dirname, "../../app/views/**/*.erb")
    ]),
    extractors: [
      {
        extensions: ["html", "js", "vue", "erb"]
      }
    ]
  })
);

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
    Popper: ["popper.js", "default"]
  })
);

module.exports = environment;
