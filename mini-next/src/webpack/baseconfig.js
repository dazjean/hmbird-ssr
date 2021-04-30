import ExtractTextPlugin from 'mini-css-extract-plugin';
import moment from 'moment';
import webpack from 'webpack';
import path from 'path';
import { getPlugin } from './get-plugin';
import { getEntry } from './get-entry';
import combine from './combine';
import tools, { getCoreConfig } from '../tools';

const clientPath = path.join(process.cwd() + '/dist/client');
const { prefixCDN, cssModule, lessModule, scssModule } = getCoreConfig();
const rootDir = tools.getOptions('rootDir');
const srcPath = path.join(process.cwd() + `/${rootDir}`);

function getBaseconfig(page, isServer = false, hotReload = false) {
    let entryObj = getEntry(page);
    let tempObj = {};
    let pluginsObj = [];
    if (hotReload) {
        for (let key in entryObj) {
            tempObj[key] = [
                'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=10000&reload=true',
                entryObj[key]
            ];
        }
        pluginsObj = [...getPlugin(entryObj, isServer), new webpack.HotModuleReplacementPlugin()];
    } else {
        tempObj = entryObj;
        pluginsObj = [...getPlugin(entryObj, isServer)];
    }

    const possLoader = {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                plugins: [
                    require('autoprefixer')({ overrideBrowserslist: ['last 2 versions'] }),
                    !tools.isDev() ? require('cssnano') : null
                ]
            }
        }
    };

    let config = {
        devtool: tools.isDev() ? 'cheap-module-eval-source-map' : false,
        mode: tools.isDev() ? 'development' : 'production',
        entry: {
            ...tempObj
        }, //类别入口文件
        output: {
            publicPath: !tools.isDev() ? prefixCDN : '/',
            libraryTarget: 'umd',
            globalObject: 'this', //webpack4之后如果umd构建在浏览器和node环境中均可使用需要设置成this
            filename: tools.isDev()
                ? '[name].js'
                : `[name].js?v=${moment().format('YYYYMMDDHHmmss')}`, //打包后输出文件的文件名
            path: clientPath //打包后的文件存放的地方
        },
        module: {
            rules: [
                {
                    test: /.js$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.jsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.ts$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /.tsx$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                modules: cssModule
                            }
                        },
                        possLoader,
                        {
                            loader: 'sass-loader' // 兼容历史方案，老版本css和scss一样的配置
                        }
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                modules: scssModule
                            }
                        },
                        possLoader,
                        {
                            loader: 'sass-loader'
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        'css-hot-loader',
                        ExtractTextPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                url: true,
                                modules: lessModule
                            }
                        },
                        possLoader,
                        {
                            loader: 'less-loader'
                        }
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                name: '[hash:8].[name].[ext]',
                                limit: 8192,
                                outputPath: 'images/'
                            }
                        }
                    ]
                }
            ]
        },
        devServer: {
            contentBase: srcPath,
            port: 8080,
            hot: true
        },
        plugins: pluginsObj,
        externals: {
            'isomorphic-fetch': {
                root: 'isomorphic-fetch',
                commonjs2: 'isomorphic-fetch',
                commonjs: 'isomorphic-fetch',
                amd: 'isomorphic-fetch'
            }
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less'],
            alias: {
                components: srcPath + '/components',
                images: srcPath + '/images',
                mock: srcPath + '/mock',
                skin: srcPath + '/skin',
                utils: srcPath + '/utils',
                config: srcPath + '/config'
            }
        }
    };
    return combine(config);
}
module.exports = {
    getBaseconfig
};
