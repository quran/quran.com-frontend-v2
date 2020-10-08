process.env.NODE_ENV = process.env.NODE_ENV || "staging";

const environment = require("./environment");

const glob = require("glob-all");
const fs = require("fs");
const path = require("path");

// Configure PurgeCSS
const PurgecssPlugin = require("purgecss-webpack-plugin");

/*var whitelist_path = "config/webpack/purgecss/whitelist.json";
var whitelist = {};

if (fs.existsSync(whitelist_path)) {
  whitelist = JSON.parse(fs.readFileSync(whitelist_path));
}*/

environment.plugins.append(
  "PurgecssPlugin",
  new PurgecssPlugin({
    whitelist: ["tajweed", ".h", "inline-comment", ".urdu", "sup"],
    whitelistPatterns: [/hlt/],
    whitelistPatternsChildren: [],
    paths: glob.sync([
      path.join(__dirname, "../../app/javascript/**/*.js"),
      path.join(__dirname, "../../app/views/**/*.erb")
    ])
  })
);

module.exports = environment.toWebpackConfig();
