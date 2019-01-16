const Path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TemplatePlugin = require('./build/plugins/template/template');
const GetModulesList = require('./build/getModulesList');
const Rules = require('./webpack.rules.config.js');
var ModulesList = GetModulesList('product');
const BuildConfig = require('./src/build.config.js');
var Template = ModulesList.template;
// 插件
var pluginsConfig = [
    new CleanWebpackPlugin(["dist"]),
    new MiniCssExtractPlugin({　　
        filename: "styles/[name].[chunkhash:8].css"
    })
]
// 编译模板页面
var len = Template.length;
for (var i = 0; i < len; i++) {
    pluginsConfig.push(new HtmlWebpackPlugin(Template[i]));
}
//添加自定义模板插件
pluginsConfig.push(new TemplatePlugin());

module.exports = {
    mode: 'production',
    entry: ModulesList.entry,
    output: {
        path: Path.join(__dirname, './' + BuildConfig.buildPath + '/' + BuildConfig.assetsPath),
        publicPath: BuildConfig.staticDomain + BuildConfig.assetsPath + "/",
        filename: BuildConfig.scriptsPath + '/[name].[hash].js',
        chunkFilename: BuildConfig.scriptsPath + '/[name].[hash].chunk.js'
    },
    module: {
        rules: Rules(true)
    },
    plugins: pluginsConfig,
    optimization: {
        splitChunks: {
            chunks: 'initial', // 只对入口文件处理
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                },
                default: false
            }
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false, // set to true if you want JS source maps
                uglifyOptions: {
                    ie8: true
                }
            }),
            new OptimizeCSSAssetsPlugin({})
        ]
    },
    resolve: {
        alias: {
            src: Path.resolve(__dirname, 'src'),
            assets: Path.resolve(__dirname, 'src/assets'),
            libs: Path.resolve(__dirname, 'src/assets/scripts/libs'),
            utils: Path.resolve(__dirname, 'src/assets/scripts/utils'),
            classes: Path.resolve(__dirname, 'src/assets/scripts/classes'),
            components: Path.resolve(__dirname, 'src/components'),
            modules: Path.resolve(__dirname, 'src/modules'),
            config: Path.resolve(__dirname, 'src/assets/scripts/config/config.js'),
            jQuery: Path.resolve(__dirname, 'src/assets/scripts/libs/zepto/zepto.min.js'),
            data: Path.resolve(__dirname, 'src/assets/scripts/data')
        }
    }

}