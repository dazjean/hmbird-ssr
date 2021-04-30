import HTMLWebpackPlugin from 'html-webpack-plugin';
import ExtractTextPlugin from 'mini-css-extract-plugin';
import AutoDllPlugin from 'autodll-webpack-plugin';
import HardSourceWebpackPlugin from 'hard-source-webpack-plugin';
import path from 'path';
import fs from 'fs';
import tools, { getEntryDir } from '../tools';

const entryDir = getEntryDir();
const rootDir = path.join(process.cwd() + '/' + tools.getOptions('rootDir'));
const global_local = `${rootDir}/template.html`;
function loadPluginHtml(page) {
    const htmlList = ['index.html', `${page}.html`];
    let template_local;
    const exists = htmlList.some((file) => {
        const htmlPath = path.join(entryDir, `${page}/${file}`);
        if (fs.existsSync(htmlPath)) {
            template_local = htmlPath;
            return true;
        }
    });
    if (exists) {
        return template_local;
    } else if (fs.existsSync(global_local)) {
        return global_local;
    } else {
        return path.join(__dirname, './template.html');
    }
}

function getPlugin(entryObj) {
    let pages = Object.keys(entryObj);
    let webpackPlugin = [];
    webpackPlugin.push(new HardSourceWebpackPlugin());
    pages.forEach(function (pathname) {
        let entryName = pathname.split('/')[0];
        let template_local = loadPluginHtml(entryName);
        let conf = {
            filename: entryName + '/' + entryName + '.html', //生成的html存放路径，相对于path
            template: template_local, //html模板路径
            title: entryName,
            inject: true, //js插入的位置，true/'head'/'body'/false
            hash: false, //为静态资源生成hash值
            chunks: [pathname], //需要引入的chunk，不配置就会引入所有页面的资源
            minify: {
                //压缩HTML文件
                removeComments: true, //移除HTML中的注释
                collapseWhitespace: false //删除空白符与换行符
            }
        };
        webpackPlugin.push(new HTMLWebpackPlugin(conf));
    });
    webpackPlugin.push(
        new AutoDllPlugin({
            inject: true,
            filename: '[name].js',
            entry: {
                vendor: ['react', 'react-dom', 'react-router-dom']
            }
        })
    );
    webpackPlugin.push(
        new ExtractTextPlugin({
            filename: `[name].css?v=[hash]`
        })
    );
    return webpackPlugin;
}
module.exports = {
    getPlugin
};
