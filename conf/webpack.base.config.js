// Подключения
//
const webpack = require('webpack')
const path = require('path');
const fs = require('fs');

const HtmlWebpackPlugin = require('html-webpack-plugin');
// ToDo const CopyWebpackPlugin = require('copy-webpack-plugin');
// Собирает все css прикрепленные к js файлу и создает для низ отдельный файл
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
// const TerserWebpackPlugin = require('terser-webpack-plugin')
// const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')


// Опционально
//
// 1. generate webapp manifest files along with 44 different icon formats
// const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
// 2. Enhances html-webpack-plugin functionality by adding the {alwaysWriteToDisk: true|false} option. Use for additional processing
// const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');


// "Авто создание страниц" - находим название файлов(страниц) и для каждого вызываем HTMLWebpackPlugin
//
const pages = [];
fs
    .readdirSync(path.resolve(__dirname, '../src/pages'))
    // ToDo так как мы используем шаблонизатор должна быть база в виде страницы с header и footer, которая явл. шаблоном, поэтому не нуждается в создании отдельной страницы
    // .filter((file) => {
    //   return file.indexOf('base') !== 0;
    // })
    .forEach((file) => {
      pages.push(file.split('/', 2));
    });

const htmlPlugins = pages.map(fileName => new HtmlWebpackPlugin({
  getData: () => {
    try {
      return JSON.parse(fs.readFileSync(`./src/pages/${fileName}/data.json`, 'utf8'));
    } catch (e) {
      console.warn(`data.json was not provided for page ${fileName}`);
      return {};
    }
  },
  filename: `${fileName}.html`,
  template: `./pages/${fileName}/${fileName}.pug`,
  // alwaysWriteToDisk: true,
  inject: 'body',
  // hash: true,
}));


// Функции
//
const filename = ext => `[name].bundle.${ext}`
// const optimization = () => {
//   const config = {
//     runtimeChunk: 'single',
//     splitChunks: {
//       chunks: 'all'
//     }
//   }
//   if (isProd) {
//     // Переписываем базовые минификаторы webpack'a
//     config.minimizer = [
//       new OptimizeCssAssetsWebpackPlugin(),
//       new TerserWebpackPlugin(),
//     ]
//   }
//   return config
// }


// Конфиг
//
module.exports = {
  mode: "development", // toDO dev
  context: path.resolve(__dirname, '../src'),
  entry:{
    "entry": ['@babel/polyfill','./entry.js'],
  },

  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: filename('js'),
    assetModuleFilename: 'assets/[name].[ext]',
  },
  // optimization: optimization(), // ToDo Dev + prod
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all'
    }
  },
  resolve: {
    modules: [
      'src',
      'node_modules'
    ]
  },
  devtool: 'source-map', //ToDo Dev
  target: 'web',
  devServer: {
    static: path.resolve(__dirname, '../dist'),
    hot: true, // //ToDo Dev=true, prod=false
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
      },
      {
        test: /\.(png|jpe?g|svg|gif)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[ext]'
        }
      },
      {
        test: /\.(ttf|eot|woff2?)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[ext]'
        }
      },
    ]
  },
  plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      // ToDo - копирование неизменяемых файлов
      // new CopyWebpackPlugin({
      //   patterns: [{
      //     from: path.resolve(__dirname, '../src/favicon.ico'),
      //     to: path.resolve(__dirname, '../dist')
      //   }]
      // }),
      new MiniCssExtractPlugin({
        filename: filename('css'),
      })].concat(htmlPlugins)
};