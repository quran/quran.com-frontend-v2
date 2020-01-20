process.env.NODE_ENV = process.env.NODE_ENV || "development";

const environment = require("./environment");
environment.config.merge({ devtool: true });

module.exports = environment.toWebpackConfig();
