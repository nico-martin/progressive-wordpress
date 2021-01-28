import path from 'path';
import fs from 'fs';

import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import LiveReloadPlugin from 'webpack-livereload-plugin';

module.exports = (env, argv) => {
  const dirDist = path.resolve(__dirname, 'assets/dist');
  const dirSrc = path.resolve(__dirname, 'assets/src');
  const dev = argv.mode !== 'production';

  return {
    entry: {
      admin: `${dirSrc}/admin/index.ts`,
      ui: `${dirSrc}/ui/index.ts`,
    },
    output: {
      path: dirDist,
      filename: '[name].js',
      publicPath: '/',
    },
    devtool: dev ? `cheap-module-eval-source-map` : undefined,
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].[id].css',
      }),
      new LiveReloadPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: '@teamsupercell/typings-for-css-modules-loader',
              options: {
                banner:
                  '// autogenerated by typings-for-css-modules-loader. \n// Please do not change this file!',
              },
            },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    [require('postcss-nested'), require('autoprefixer')],
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    resolve: {
      alias: {},
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    externals: {
      /*
      react: 'preactCompat',
      'react-dom': 'preactCompat',*/
      react: 'React',
      'react-dom': 'ReactDOM',
      '@wordpress/components': 'wp.components',
      '@wordpress/i18n': 'wp.i18n',
    },
  };
};
