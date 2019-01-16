const Consoler = require('consoler');
const Fs = require('fs');
const Page = require('../src/page.config.js');
/**
 * 设置编译环境配置
 * @param {String} env  'develop'|'product'
 */
var setEnvironment = function (env) {
    var filePath = 'src/build.config.js';
    var configStr = Fs.readFileSync(filePath, "utf-8");
    configStr = configStr.replace(/environment\s*\:\s*(['"])([^'"]*)(['"])/g, function () {
        var _arg = arguments;
        return 'environment: ' + _arg[1] + env + _arg[3];
    });
    Fs.writeFileSync(filePath, configStr);
}

/***
 * 获取viewport相关代码
 */
var getViewportCode = function () {
    var filePath = 'src/assets/scripts/libs/viewport.min.js';
    var content = '';
    if (Fs.existsSync(filePath)) {
        content = Fs.readFileSync(filePath, "utf-8");
    }
    return content;
}

/**
 * 获取入口脚本和入口页面
 * @param {String} env 当前编译环境变量 develop|product
 */
var getModulesList = function (env) {
    setEnvironment(env);
    Config = require('../src/build.config.js');
    try {
        var entry = {};
        var entryNames = [];
        var libs = Config.jsLibs;
        for (var i in libs) {
            var item = libs[i];
            var name = item.name;
            entry[name] = item.src;
            entryNames.push(name);
        }
        var template = [];
        var viewPortCode = getViewportCode();
        for (let _file in Page) {
            let _page = Page[_file];
            let file = _page.name;
            let _path = '';
            let exportPath = ''; //页面输出路径
            if (_page.path && _page.path !== '') {
                _path = _page.path;
                let ret = _path.match(/modules\/(\S*)$/);
                if (ret && ret.length && ret.length > 1) {
                    exportPath = ret[1] + '.html';
                } else {
                    Consoler.error("error：找不到页面" + _path + "，页面必须在src/modules路径下", ['red']);
                    return;
                }
            } else {
                _path = "./src/modules/" + file;
                exportPath = file + '.html';
            }
            if (!Fs.existsSync(_path)) {
                Consoler.error("error：找不到路径" + _path, ['red']);
                return false;
            }
            let entryName = _page.entryName || file;
            entry[entryName] = _path + '/' + file + '.js';

            var templateOptions = {
                name: file,
                title: _page.title || Config.defaultPageTitle,
                serverSide: _page.serverSide || false,
                designWidth: _page.designWidth || null,
                designFontSize: _page.designFontSize || null,
                checkRatio: _page.checkRatio || false,
                viewPortCode: viewPortCode,
                isWX: _page.isWX || false,
                filename: env === 'develop' ? exportPath : ('../' + exportPath),
                template: _page.serverSide ? _path + "/" + file + '.ejs' : "./src/template/template.ejs",
                inject: false,
                chunks: [].concat(entryNames, entryName),
            };
            //判断是否具有build.data.js
            let buildDataPath = _path + '/' + 'build.data.js';
            if (Fs.existsSync(buildDataPath)) {
                templateOptions.buildData = require('../'+buildDataPath);
            }

            if (env === 'product') {
                if (Config.staticDomain != "") {
                    templateOptions["staticDomain"] = Config.staticDomain;
                }
                templateOptions["minify"] = {
                    removeEmptyAttributes: true,
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true
                };
            }
            template.push(templateOptions);
        }
        return {
            entry: entry,
            template: template
        };
    } catch (err) {
        Consoler.error(err);
    }
};
module.exports = getModulesList;