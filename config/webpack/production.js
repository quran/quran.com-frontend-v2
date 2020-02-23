process.env.NODE_ENV = process.env.NODE_ENV || "production";

const environment = require("./environment");
/*
const CompressionPlugin = require("compression-webpack-plugin");

environment.plugins.append(
  "Compression",
  new CompressionPlugin({
    filename: "[path].gz[query]",
    algorithm: "gzip", // gzip , zopfli
    cache: true,
    test: /\.(js|css|html|json|ico|svg|eot|otf|ttf)$/
  })
);

// TODO: https://github.com/rails/webpacker/blob/master/docs/deployment.md#installing-the-ngx_brotli-module
environment.plugins.append(
  "Compression Brotli",
  new CompressionPlugin({
    filename: "[path].br[query]",
    algorithm: "brotliCompress",
    cache: true,
    test: /\.(js|css|html|json|ico|svg|eot|otf|ttf)$/,
    compressionOptions: { level: 11 },
    threshold: 10240, // min file size in bytes to trigger the compression.
    minRatio: 0.8
  })
);
*/
module.exports = environment.toWebpackConfig();
