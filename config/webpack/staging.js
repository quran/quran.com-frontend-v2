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
    safelist: {
      standard: ["tajweed", ".h", "inline-comment", ".urdu", "sup", "select2"],
      deep: [/hlt/, 'aria-disabled', 'modal-open', /icon-/],
      greedy: []
    },
    paths: glob.sync([
      path.join(__dirname, "../../app/javascript/**/*"),
      path.join(__dirname, "../../app/views/**/*")
    ])
  })
);
module.exports = environment.toWebpackConfig();
