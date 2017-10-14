var webpack = require('webpack');
var path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    target: 'web',

    entry: {
        app: path.join(__dirname, './lib/index.js')
    },

    output: {
        publicPath: '/',
        path: path.join(__dirname, './dist/'),
        filename: 'bundle.js',

        library: 'reduxActionValidator',
        libraryTarget: 'umd',
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            cacheDirectory: true,
                            presets: [
                                ['babel-preset-env', {
                                    modules: false,
                                    targets: {
                                        uglify: true,
                                        // TODO CONSIDER OLDER VERSIONS
                                        browsers: [
                                            'last 2 Chrome versions',
                                            'last 2 Firefox versions',
                                            'last 2 Safari versions',
                                            'Edge 15'
                                        ]
                                    },
                                    debug: true
                                }]
                            ],
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            comments: false,
            compress: {
                drop_console: true,
                drop_debugger: true,
                warnings: false,
                unused: true,
                dead_code: true,
                screw_ie8: true,
            },
            mangle: {
                screw_ie8: true,
            },
            output: {
                comments: false,
                screw_ie8: true,
            },
        })
    ]
};
