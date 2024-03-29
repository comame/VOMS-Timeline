const { compilerOptions } = require('./tsconfig.json')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const developmentCommon = {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        new CleanWebpackPlugin()
    ],
    resolve: {
        extensions: [ '.ts', '.tsx', '.js' ]
    }
}

const frontend = {
    name: 'frontend',
    entry: './src/front/app.tsx',
    output: {
        filename: 'app.js',
        path: __dirname + '/dist/front',
        assetModuleFilename: '[name][ext]'
    },
    module: {
        rules: [{
            test: /.scss$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    sourceMap: true,
                    url: false
                }
            }, {
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }]
        }, {
            test: /.(tsx|.ts)$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    compilerOptions
                }
            }]
        }, {
            test: /.html$/,
            type: 'asset/resource'
        }, {
            test: /assets\//,
            type: 'asset/resource'
        }]
    }
}

const server = {
    name: 'server',
    target: 'node',
    node: {
        __dirname: false
    },
    entry: './src/server/app.ts',
    output: {
        filename: 'app.js',
        path: __dirname + '/dist/server'
    },
    module: {
        rules: [{
            test: /.ts$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    compilerOptions
                }
            }]
        }]
    },
    externals: {
        express: 'commonjs express',
        mongodb: 'commonjs mongodb',
        'fast-xml-parser': 'commonjs fast-xml-parser'
    },
    optimization: {
        minimize: false
    }
}

module.exports = [{
    ...developmentCommon,
    ...frontend
}, {
    ...developmentCommon,
    ...server
}]
