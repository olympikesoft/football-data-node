const path = require("path");
const webpack = require("webpack");

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: "./bin/www",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    fallback: {
      fs: false,
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /(sqlite3|pg|pg-query-stream|oracledb|mysql2|tedious)/,
    }),
  ],
};
