//自动创建模块、组件模版
const Fs = require('fs');
const Consoler = require('consoler');
let args = process
    .argv
    .splice(2);

let TYPE = args[0],
    NAME = args[1] || null,
    PATH = args[2] || null,
    SEVER_SIDE = args[3] || null;

SEVER_SIDE = SEVER_SIDE === 'serverSide' ? true : null;
if (PATH === 'serverSide') {
    SEVER_SIDE = true;
    PATH = null;
}

if (!NAME || NAME.trim() === '') return;
if (PATH && PATH.trim() !== '' && /\/$/.test(PATH)) {
    Consoler.error("error：请不要在路径结尾处包含/", ['red']);
}


//给src/page.config.js自动添加页面信息
let setPageParam = function (_name, _src) {
    let filePath = 'src/page.config.js';
    let str = Fs.readFileSync(filePath, "utf-8");
    str = str.replace(/\/\*\*这是为node脚本自动添加配置信息预留占位符，请勿删除和编辑此行\*\//g, function () {
      	let fixedStr = arguments[0];
        let configStr =
            `,{
                name: '${_name}',
                title: '',
                serverSide: ${SEVER_SIDE ? true : false},
                path: '${_src}',
                entryName: '${_name}'
            }
            ${fixedStr}`
        return configStr;
    });
    Fs.writeFileSync(filePath, str);
}

let templatePath = '';
let distPath = '';
if (TYPE === 'module') {
    templatePath = SEVER_SIDE ? './src/template/serverSideModules' : './src/template/frontSideModules';
    distPath = PATH ? "./src/" + PATH + '/' + NAME : './src/modules/' + NAME;
    setPageParam(NAME, distPath);
} else if (TYPE === 'component') {
    templatePath = './src/template/components';
    distPath = PATH ? "./src/" + PATH + '/' + NAME : './src/components/' + NAME;
} else {
    Consoler.error("error：" + "指令有误，正确指令为：npm run create module|component name path", ['red']);
}

if (Fs.existsSync(distPath)) {
    Consoler.error("error：" + distPath + "目录已存在", ['red']);
    return;
}


const copy = function (src, dst) {
    Fs.writeFileSync(dst, Fs.readFileSync(src));
};
//创建目录
const createDir = function (path) {
    if (!Fs.existsSync(path)) {
        Fs.mkdirSync(path);
    }
}

//递归创建目录
const createDirRecursive = function (dir) {
    let dirs = dir.split('/');
    let _dir = '';
    if (dirs.length) {
        for (let i = 0; i < dirs.length; i++) {
            _dir += dirs[i] + '/';
            if (!Fs.existsSync(_dir)) {
                Fs.mkdirSync(_dir);
            }
        }
    }
}

//获取模版内容
const getTemplate = function (_temPath, _distPath) {
    if (Fs.existsSync(_temPath)) {
        let files = Fs.readdirSync(_temPath);
        if (files.length) {
            files
                .forEach(function (file, index) {
                    if (file.indexOf("svn") != -1) {
                        return true;
                    }
                    let src = _temPath + "/" + file;

                    if (/^template\.[a-z]+$/.test(file)) {
                        file = file.replace('template', NAME);
                    }
                    let dst = _distPath + "/" + file;
                    var stat = Fs.lstatSync(src);
                    if (stat.isDirectory()) {
                        createDir(dst);
                        getTemplate(_temPath + "/" + file, dst);
                    } else {
                        copy(src, dst);
                    }
                });
        }
    }
};

Consoler.loading('正在拷贝模版文件,请稍后...');
createDirRecursive(distPath);
getTemplate(templatePath, distPath);
Consoler.success('模板拷贝成功!');