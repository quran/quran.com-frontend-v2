process.env.NODE_ENV = process.env.NODE_ENV || "local";

const environment = require("./environment");

module.exports = environment.toWebpackConfig();
