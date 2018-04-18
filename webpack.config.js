/**
 * Created by gongmin on 2017/9/7.
 */
const webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    entry: {
        index:'./src/js/index.js',
    },
    output: {
        filename: 'component-chart.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.scss$/,
                loader: "style-loader!css-loader!sass-loader"
            }, //sass加载器
            {
                test: /\.json$/,exclude: /node_modules/,
                loader: 'json-loader'
            }
        ]
    },

    plugins: [
        //new webpack.optimize.UglifyJsPlugin({
        //  compress: {
        //    warnings: false,
        //  },
        //  output: {
        //    comments: false,
        //  },
        //}),//压缩和丑化

        new webpack.ProvidePlugin({
            $: 'jquery'
        })//直接定义第三方库

    ]
};