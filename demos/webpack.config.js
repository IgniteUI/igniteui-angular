const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');


const config = {
    devtool: 'source-map',
    entry: {
        polyfills: path.resolve(__dirname, 'app', 'polyfills.browser.ts'),
        main: path.resolve(__dirname, 'app', 'main.ts')
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: path.resolve(__dirname, 'tsconfig.json')
                        }
                    },
                    {
                        loader: "angular2-template-loader"
                    }
                ]
            },

            {
                test: /\.css$/,
                use: [
                    {
                        loader: "to-string-loader"
                    },
                    {
                        loader: "css-loader",
                        options: { minimize: true }
                    }
                ]
            },

            {
                test: /\.scss$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader", options: {
                        sourceMap: true
                    } // translates CSS into CommonJS
                }, {
                    loader: "postcss-loader", options: {
                        ident: "postcss",
                        sourceMap: true,
                        plugins: [
                            require('autoprefixer')({
                                browsers: ["last 5 versions", "> 3%"],
                                cascade: false,
                                grid: true
                            })
                        ]
                    }
                }, {
                    loader: "sass-loader", options: {
                        sourceMap: true
                    } // compiles Sass to CSS
                }]
            },

            {
                test: /\.html$/,
                use: "raw-loader"
            }
        ]
    },
    plugins: [
        new webpack.ProgressPlugin(),

        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.ejs'),
            title: "IgniteUI for Angular Samples",
            inject: 'body'
        }),

        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)@angular/,
            path.resolve(__dirname, 'app'),
            {}
        ),

        new CommonsChunkPlugin({
            name: 'polyfills',
            chunks: ['polyfills']
        }),

        new CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['main'],
            minChunks: module => /node_modules/.test(module.resource)
        }),

        new CommonsChunkPlugin({
            name: ['polyfills', 'vendor'].reverse()
        }),
    ],

    devServer: {
        port: 8000,
        historyApiFallback: true,
        watchOptions: {
            aggregateTimeout: 30,
            poll: 1000
        }
    }
};

module.exports = config;
