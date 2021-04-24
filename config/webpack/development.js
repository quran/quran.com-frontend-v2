process.env.NODE_ENV = process.env.NODE_ENV || "development";

const environment = require("./environment");

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

environment.plugins.prepend(
  "BundleAnalyzerPlugin",
  new BundleAnalyzerPlugin()
);

module.exports = smp.wrap(environment.toWebpackConfig());
