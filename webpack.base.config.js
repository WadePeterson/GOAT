const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const gameNames = ['baby-monkey', 'flappy-bird-cat', 'goat'];

const entry = {};
const plugins = [];

gameNames.forEach(gameName => {
  entry[gameName] = path.join(__dirname, `src/games/${gameName}/index.ts`);
  plugins.push(new HtmlWebpackPlugin({
    chunks: [gameName],
    filename: `${gameName}/index.html`,
    template: path.join(__dirname, 'src/index.html')
  }));
});

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js'
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      pixi: path.join(__dirname, 'node_modules/phaser-ce/build/custom/pixi.js'),
      phaser: path.join(__dirname, 'node_modules/phaser-ce/build/custom/phaser-split.js'),
      p2: path.join(__dirname, 'node_modules/phaser-ce/build/custom/p2.js')
    }
  },
  plugins,
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' },
      { test: /\.json$/, use: 'json-loader' },
      { test: /\.html$/, use: 'html-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /(fonts|assets)(\/|\\)/, use: 'file-loader?name=assets/[hash].[ext]' },
      { test: /pixi\.js$/, use: 'expose-loader?PIXI' },
      { test: /phaser-split\.js$/, use: 'expose-loader?Phaser' },
      { test: /p2\.js$/, use: 'expose-loader?p2' }
    ]
  }
};
