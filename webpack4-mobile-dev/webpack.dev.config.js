const Path = require('path');
const Webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const TemplatePlugin = require('./build/plugins/template/template');
const GetModulesList = require('./build/getModulesList');
const Rules = require('./webpack.rules.config.js');
var ModulesList = GetModulesList('develop');
const BuildConfig = require('./src/build.config.js');
var Template = ModulesList.template;

// 插件
var pluginsConfig = [
    new CleanWebpackPlugin(["dist"]),
    new Webpack.HotModuleReplacementPlugin()
]
var len = Template.length;
for (var i = 0; i < len; i++) {
    pluginsConfig.push(new HtmlWebpackPlugin(Template[i]));
}
pluginsConfig.push(new TemplatePlugin());
//获取反向代理配置
const getProxyConfig = function () {
    var proxyRule = BuildConfig.devServer.proxy;
    var proxy = {};
    for (var i = 0; i < proxyRule.length; i++) {
        var tmp = proxyRule[i];
        proxy[tmp.rule] = tmp.to;
    }
    return proxy;
};
module.exports = {
    mode: 'development',
    entry: ModulesList.entry,
    output: {
        path: Path.join(__dirname, './' + BuildConfig.buildPath),
        publicPath: '/',
        filename: BuildConfig.assetsPath + '/' + BuildConfig.scriptsPath + '/[name].js',
        chunkFilename: BuildConfig.assetsPath + '/' + BuildConfig.scriptsPath + '/[name].chunk.js'
    },
    plugins: pluginsConfig,
    devServer: {
        contentBase: Path.join(__dirname, './' + BuildConfig.buildPath),
        disableHostCheck: true,
        publicPath: '/',
        host: BuildConfig.devServer.host,
        port: BuildConfig.devServer.port,
        open: true, // 开启浏览器
        hot: true, // 开启热更新
        proxy: getProxyConfig() //设置反向代理
    },
    devtool: "source-map", // 开启调试模式
    module: {
        rules: Rules(false)
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    name: "vendors",
                    chunks: "initial",
                    minChunks: 2
                },
                common: {
                    name: "common",
                    chunks: "initial",
                    minChunks: 2
                },
                base: {
                    name: "base",
                    chunks: "initial",
                    minChunks: 2
                },
                default: {
                    minChunks: 2,
                    reuseExistingChunk: false
                }
            }
        }
    },
    resolve: {
        alias: {
            src: Path.resolve(__dirname, 'src'),
            assets: Path.resolve(__dirname, 'src/assets'),
            libs: Path.resolve(__dirname, 'src/assets/scripts/libs'),
            classes: Path.resolve(__dirname, 'src/assets/scripts/classes'),
            utils: Path.resolve(__dirname, 'src/assets/scripts/utils'),
            components: Path.resolve(__dirname, 'src/components'),
            modules: Path.resolve(__dirname, 'src/modules'),
            config: Path.resolve(__dirname, 'src/assets/scripts/config/config.js'),
            jQuery: Path.resolve(__dirname, 'src/assets/scripts/libs/zepto/zepto.min.js'),
            data: Path.resolve(__dirname, 'src/assets/scripts/data')
        }
    }
}