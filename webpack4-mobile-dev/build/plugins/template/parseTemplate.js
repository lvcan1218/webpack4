var fs = require("fs");
var Path = require('path');
var jsdom = require("jsdom");
var {
    JSDOM
} = jsdom;

/**
 * 设置组件参数
 */
var _setCompAttrs = function (node, params) {
    if (node.nodeType === 1 && node.nodeName !== 'STYLE' && node.nodeName !== 'SCRIPT') {
        /**
         * 增加  style  class  ref   等属性 
         */
        if (params._class) {
            let clsList = params._class.split(' ');
            clsList.forEach((cls) => {
                let _cls = cls.trim();
                _cls !== '' && node.classList.add(_cls);
            });
        }
        if (params._style) {
            let sList = params._style.split(';');
            sList.forEach((sty) => {
                if (sty.trim() === '') return;
                let _styArr = sty.split(':');
                let _styName = _styArr[0].trim(),
                    _styValue = _styArr[1].trim();
                _styName !== '' && (node.style[_styName] = _styValue);
            })
        }
        if (params._ref) {
            let ref = params._ref.trim();
            ref !== '' && node.setAttribute('ref', ref);
        }
    }

}

var compileFile = function (dom) {
    let fNodes = dom.querySelectorAll('template[file]');
    if (fNodes && fNodes.length) {
        fNodes.forEach((fNode) => {
            let fType = fNode.getAttribute('type');
            let fParentNode = fNode.parentNode;
            let content = fNode.content;
            let _dom;
            if (fType === 'style') {
                _dom = doc.createElement('style');
                _dom.appendChild(content);
                fParentNode.insertBefore(_dom, fNode);
                fParentNode.removeChild(fNode);
            } else if (fType === 'script') {
                _dom = doc.createElement('script');
                _dom.setAttribute('type', 'text/javascript')
                _dom.appendChild(content);
                fParentNode.insertBefore(_dom, fNode);
                fParentNode.removeChild(fNode);
            } else if (fType === 'html') {
                compileFile(content);
                fParentNode.insertBefore(content, fNode);
                fParentNode.removeChild(fNode);
            }
        });
    }
}

var html_decode = function (str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br\/>/g, "\n");
    return s;
}

var compileChildren = function (dom, buildData) {
    //获取所有子template节点
    let children = dom.querySelectorAll('template[component]');
    if (children && children.length) {
        children.forEach((_chi) => {
            //获取当前组件的属性
            let params = {
                _class: _chi.getAttribute('class'),
                _style: _chi.getAttribute('style'),
                _ref: _chi.getAttribute('ref')
            }

            //获取当前组件的插槽名
            let slot = _chi.getAttribute('slot');

            // 获取父组件的插槽位置
            let $slot = null;
            let parentNode = _chi.parentNode;
            if (slot && slot !== '') {
                $slot = parentNode.querySelector('[slot=' + slot + ']');
            }

            //当前template节点的内容
            let _content = _chi.content;

            //根据build.data渲染tpl模板 模板ref参数应该和build.data的字段一致
            let _path = _chi.getAttribute('component');
            if (/\.tpl$/.test(_path) && buildData && buildData[params._ref]) {
                let str = html_decode(_chi.innerHTML);
                let ret = /function\s*\(obj\)[\s\S]*?return\s*__p\s*}/.exec(str);
                if (ret && ret.length) {
                    try {
                        let funcStr = ret[0];
                        eval('var render = ' + funcStr);
                        let _html = render(buildData[params._ref]);
                        str = str.replace(funcStr, _html);
                        _chi.innerHTML = str;
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            //递归渲染子组件
            _content.querySelectorAll('template[component]').length && compileChildren(_content, buildData);

            //节点拷贝到template点外面
            let childNodes = _content.childNodes;
            childNodes.forEach((node) => {
                if (!slot || slot === '') {
                    //如果不需要插槽，则直接插入到当前template节点前面
                    parentNode.insertBefore(node, _chi);
                } else if ($slot) {
                    //如果需要插槽，并且已找到插槽，则插入到父组件对应的插槽位置
                    $slot.appendChild(node);
                }
                //设置组件的属性
                _setCompAttrs(node, params);
            });

            // 删除template节点
            parentNode.removeChild(_chi);
        });
    }


}

var run = function (html, callback, buildData) {
    let dom = new JSDOM(html);
    let win = dom.window;
    let doc = win.document;
    compileChildren(doc, buildData);
    compileFile(doc);
    callback && callback(dom.serialize());
}

exports.run = run;