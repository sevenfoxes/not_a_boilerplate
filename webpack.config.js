const MomentLocalesPlugin = require("moment-locales-webpack-plugin");
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackManifestPlugin = require("webpack-manifest-plugin");
// const CompressionPlugin = require("compression-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");

module.exports = (_, argv) => {
  const isProd = argv.mode === "production";

  return {
    devtool: isProd ? "none" : "inline-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
            },
          ],
        },
        {
          test: /\.s?css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: !isProd,
                indentedSyntax: false,
              },
            },
            { loader: "css-loader", options: { sourceMap: !isProd } },
            "postcss-loader",
            {
              loader: "sass-loader",
              options: {
                sourceMap: false,
                includePaths: [path.resolve("node_modules"), path.resolve("src/styles")],
                data: `@import "shared-styles";`,
                outputStyle: isProd ? "compressed" : "compact",
              },
            },
          ],
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].[hash].js",
      publicPath: "/",
    },
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        maxSize: 10000,
        automaticNameDelimiter: "_",
      },
    },
    plugins: [
      new ESLintPlugin({
        files: "./src",
      }),
      new MomentLocalesPlugin(),
      new MomentTimezoneDataPlugin({
        startYear: new Date().getFullYear() - 2,
        endYear: new Date().getFullYear() + 10,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[name].[id].css",
      }),
      new HtmlWebPackPlugin({
        favicon: "./public/favicon.ico",
        template: "./public/index.html",
        filename: "./index.html",
      }),
      new WebpackManifestPlugin(),
      // I think this was unhappy that I don't have any css files
      // new CompressionPlugin({
      //   filename: "[path].gz[query]",
      //   algorithm: "gzip",
      //   test: /\.js$|\.css$|\.html$/,
      //   threshold: 0,
      //   minRatio: 0.8,
      // }),
    ],
    resolve: {
      modules: [
        path.resolve(__dirname, "src"),
        "node_modules",
      ],
      alias: {
        "lodash-es": "lodash",
        "lodash.debounce": "lodash/debounce",
      },
    },
    devServer: {
      host: "0.0.0.0",
      port: 3030,
      publicPath: "/",
      compress: true,
      hot: true,
      historyApiFallback: true,
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
};
