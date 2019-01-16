前端组件化工程

一、环境搭建

1、准备环境

（1）下载node.js 网址：http://nodejs.cn/ 

（2）指向淘宝镜像 运行命令 npm install -g cnpm --registry=https://registry.npm.taobao.org

（3）下载项目代码 git地址：http://192.168.6.10:3000/caojianyu/front-end-comp-proj

（4）建议安装vscode开发工具 网址：https://code.visualstudio.com/


2、打开工程，运行项目

 （1）安装依赖包 
        cnpm install 或 npm install

 （2）开启本地服务 
        npm run dev

 （4）创建组件(path可以任意指定,默认为src/components)
        npm run create component name path

        例如：npm run create component test     
        在src/components目录下创建名为test的组件

        例如：npm run create component test modules/test/test/index/_components    
        在src/modules/test/test/index/_components目录下创建名为test的组件

 （5）创建页面(path可以任意指定,默认为src/modules)
        npm run create module name path            //创建前端渲染页面

        例如：npm run create module test modules/test/test/test/test/here   
        在src/modules/test/.../test/here  目录下创建名为test的前端渲染页面
        
        npm run create module name path serverSide //创建后端渲染页面（前后端混合渲染页面属于此类）

        例如：npm run create module test modules/test/test/test/test/here serverSide  
        在src/modules/test/.../test/here  目录下创建名为test的后端渲染的页面

二、代码发布

  构建线上代码  npm run build


三、注意事项

  1、由于此项目主要针对c端，力求减小代码尺寸，避免引入过多的polyfill兼容代码，建议大家可以使用es6的语法，但是尽量不要使用ES6新的API方法。

  比如let 、 const 、class、 箭头函数等语法可以使用，而 Object.assign、Array.from、Promise、Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol等新的API最好不要使用。

  2、单个组件可以嵌套（参照src/components/ad组件），但是嵌套后的组件调用的时候不能再设置子组件
 
四、帮助文档

（1）es6入门 http://es6.ruanyifeng.com/

（2）webpack https://doc.webpack-china.org/



五、组件化工程使用说明

    1、项目源码src内目录结构为

        assets:     js css image等静态资源目录
        components: 所有的组件目录
        modules:    所有的模块目录，一个模块为一个单页应用，编译的时候会根据modules内的目录名生成对应的name.html文件
        template:   项目模板文件，这主要是用来创建新的module页面或者component组件时使用
        vendors.js  源码里面代码为空，编译过程中会自动添加项目的环境依赖脚本
        common.js   存放一些公共的脚本或者文件，编译时会自动将源码添加到该文件中
        jquery.js   由于jquery压缩后仍然占据较大空间，因此单独作为一个文件引入
        mobile-libs.js   存放移动端开发需要的脚本文件，编译时会自动将源码添加到该文件中
        build.config.js  当前项目的配置文件（必须）
        page.config.js   当前项目的页面配置文件（必须）
        property.json    项目的部署配置文件（如版本号）

    2、新建组件component

        通过在src/components目录下新建对应的组件文件目录结构如：
        images/ 
        scripts/ 
        styles/ 
        tpls/ 
        xxx.js
        组件内部图片放在组件内部的images/目录，公用图片放src/assets/images/目录；

        组件内部样式文件，放在styles/目录,公共样式放src/assets/styles/目录

        组件内部的html模板，放在tpls/目录，其中，纯静态模板片段以.html格式存储；需要前端渲染的模板以.tpl格式存储，
        前端渲染使用ejs模板引擎，打包时会自动对.tpl的文件进行预编译提高前端渲染效率；
        后端渲染的模板以.html格式存储（建议以xxx.server.html规范命名）。
        如果一个组件既有前端渲染又有后端渲染，那么需要同时写两个模板文件。

        xxx.js为组件的初始化脚本，此脚本导出为一个组件类（继承于src/assets/scripts/classes/component.js类），
        类的实例化操作会自动进行组件的初始化操作，通过传入options.serverSide = true|false，可控制当前组件初始化为前段渲染组件或后端渲染组件。
        代码示例如下：
            
            组件模板html的写法：

            <div class="page">
                <div slot="header"></div>
                <div slot="body"></div>
                <div slot="footer"></div>
            </div>

            组件类的写法：

            import './styles/xxx.style';
            import Tpl from './tpls/xxx.html';
            import Component from 'classes/component';
            class Xxx extends Component{
                constructor(options) {
                    let defaults = {
                        $wraper: null,
                        html: Tpl,
                        serverSide: false,
                        parameters: {},
                    }
                    $.extend(defaults,options);
                    super(defaults);
                }
                beforeMounted(){},
                mounted(){},
                beforeDestroyed(){},
                destroyed(){}
            }
            export default Xxx;

            options配置项 = {
                $wraper: null,      //当前组件插入的插槽dom的jquery对象（注意：只有顶级组件才需要设置此参数；作为子组件引入时，需要设置slot参数）
                html: '',           //当前组件的html模板片段（前端渲染时才需要设置）
                ref: '',            //当前组件实例的全局引用，可通过Component.$refs[ref]访问
                serverSide: false,  //当前组件是否是后端渲染组件
                class: '',          //当前组件的自定义样式类名（前端渲染时才需要设置）
                style: '',          //当前组件的自定义样式（前端渲染时才需要设置）
                parameters: {},     //页面parameter参数，主要是指地址栏参数
                slot: '',           //当前组件对应的父组件插槽名（作为子组件引入时才需要设置）
                component: null,    //当前组件的类（作为子组件引入时才需要设置）
                children: []        //当前组件内嵌入的子组件列表
            }

        组件生命周期方法为：

            beforeMounted(){},  组件挂载前，组件html尚未挂载到页面上，可以执行一些组件初始化的准备工作（对于options.serverSide = true的后端渲染组件，
            不会触发此生命周期方法，因为组件html已经在编译的时候挂载到页面指定位置)。

            mounted(){},        组件已挂载，组件html已经挂载到页面上，可以执行一些事件绑定和数据请求等操作。

            beforeDestroyed(){},组件销毁前，可以执行一些组件销毁前的操作，比如移除事件，关闭定时器等。

            destroyed(){}       组件已销毁，可以执行一些组件销毁后的逻辑操作。

    3、前端渲染开发流程

        首先创建页面所需要的子组件，并在对应的src/modules/xxx/xxx.js入口脚本内引入各组件的类。
        然后进行组件的实例化，示例代码如下：

            import Page from "components/page/page.js";
            import header from "components/header/header";
            import indexMain from "components/indexMain/indexMain";
            import indexMenu from "components/indexMenu/indexMenu";
            import footer from "components/footer/footer";
            import Component from "classes/component";
            new Page({
                $wraper: $('#app'),
                ref: 'page',
                class: 'c-test-page',
                children: [{
                    ref: 'header',
                    slot: 'header',
                    component: header
                }, {
                    ref: 'indexMain',
                    slot: 'body',
                    component: indexMain,
                    children: [{
                        $ref: 'indexMenu',
                        slot: 'menu',
                        component: indexMenu
                    }]
                }, {
                    ref: 'footer',
                    slot: 'footer',
                    component: footer
                }],
                parameters: {
                    test: 'hello world'
                }
            });
            /* 页面的其他逻辑代码 */


    4、后端渲染组件化开发示例
        
        首先在创建页面所需要的子组件，然后在页面对应的src/modules/xxx/xxx.html模板入口脚本文件内添加后端组件模板代码，示例如下：
            
            <!-- 后端渲染页面模板 -->
            <div id="header">
                <template ref="header" class="test-header test-header2  test-header3" style="color:#333; font-size:12px; background-color:#333;"
                    component="../../components/header/tpls/header.server.html"></template>
            </div>
            <div id="body" class="c-body">
                <template component="../../components/indexMain/tpls/indexMain.server.html">
                    <template ref="indexMenuInMain" class="bg-white" slot="menu" component="../../components/indexMenu/tpls/indexMenu.server.html"></template>
                </template>
                <template ref="indexMenu" class="bg-white" style="color:#fff; background-color:#f00;" component="../../components/indexMenu/tpls/indexMenu.server.html"></template>
            </div>
            <div id="footer">
                <template component="../../components/footer/tpls/footer.server.html"></template>
            </div>
            <img height="30px" src="../../components/header/images/phone.png">

            名词解释：
             <template component="xxx.server.html" ref="refName" slot="slotName"  class="css-class" style="styleName:styleValue;">
             或
             <template type="html" file="./xxx.html"></template>
             <template type="style" file="./xxx.html"></template>
             <template type="script" file="./xxx.html"></template>
             
             其中template为组件化模板引入语法，有component参数则引入类型为组件（component的value值为组件模板的地址）；
             如果是 type="html|style|script" 则表明引入的是普通文件（file的value值为对应文件地址，
             如果type为style会自动给引入内容添加 <style></style>标签，如果type为script会自动给引入内容添加<script></script>标签）。
             
             引入类型为组件的模板可以接收 ref、slot、class、style 等属性。
                
                ref:组件引用，与入口脚本内的ref对应，用于此组件的全局标志；

                slot:组件插槽，如果组件为子组件的方式引入，则增加slot属性，表示当前组件将插入父组件的哪个插槽。

                class和style： 为给组件添加样式类名或样式。


        然后在页面对应的src/modules/xxx/xxx.js入口脚本文件内引入各组件的类。 然后进行组件的实例化，示例代码如下：

            import header from "components/header/header";
            import indexMain from "components/indexMain/indexMain";
            import indexMenu from "components/indexMenu/indexMenu";
            import footer from "components/footer/footer";
            import Component from "classes/component";
            new header({
                ref: 'header',
                serverSide:true,
                parameters: {
                    test: 'hello world'
                }
            });
            new indexMain({
                ref: 'indexMain',
                serverSide:true,
                parameters: {
                    test: 'hello world'
                }
            });
            new indexMenu({
                ref: 'indexMenu',
                serverSide:true,
                parameters: {
                    test: 'hello world'
                }
            });
            new indexMenu({
                ref: 'indexMenuInMain',
                serverSide:true,
                parameters: {
                    test: 'hello world'
                }
            });
            new footer({
                ref: 'footer',
                serverSide:true,
                parameters: {
                    test: 'hello world'
                }
            });
             /* 页面的其他逻辑代码 */

六、后端渲染时，构建动态组件模板（增强后端渲染组件的可重用性）
    示例：
    <template ref="page" component="components/page/tpls/index.server.html">
        <template ref="tabPanel" slot="body" component="components/base/tabPanel/tpls/index.server.tpl">
            <template ref="tab1" slot="tab1" component="./_components/tabTitle/tpls/index.server.tpl"></template>
            <template ref="tab2" slot="tab2" component="./_components/tabTitle/tpls/index.server.tpl"></template>
            <template ref="tab3" slot="tab3" component="./_components/tabTitle/tpls/index.server.tpl"></template>
            <template ref="panel1" slot="panel1" component="./_components/main/tpls/index.server.html"></template>
            <template ref="panel2" slot="panel2" component="./_components/main/tpls/index.server.html"></template>
            <template ref="panel3" slot="panel3" component="./_components/main/tpls/index.server.html"></template>
        </template>
    </template>
    其中具有动态模板的组件tabpanel:
    <template ref="tabPanel" slot="body" component="components/base/tabPanel/tpls/index.server.tpl"></template>
    内部代码为：
    <div class="c-tabs-panel">
        <!-- 设置tab标题高度 -->
        <div class="c-tabs-panel-tabs-wraper" style="<%= titleHeight && titleHeight != '' ? 'height:'+ titleHeight + ';' : '' %>">
            <div class="c-tabs-panel-tabs-content">
                <ul data-ani-tabs class="c-tabs-panel-tabs-list">
                    <!-- 设置tab插槽 -->
                    <% for(var i = 0; i < tabs.length; i ++){%>
                        <li data-tab-item class="c-tabs-panel-tab" ref="<%= tabs[i].ref %>" slot="<%= tabs[i].slot %>" 
                        style="<%=  tabWidth && tabWidth!=='' ? 'width:'+tabWidth+';' : '' %>">
                        </li>
                    <% } %>
                    <!-- 设置tab标题下划线央视 -->
                    <li data-ani-line class="c-tabs-panel-tabs-underline" 
                    style="<%= tabWidth && tabWidth!=='' ? 'width:'+tabWidth + '; ' : ''%> <%= lineStyle && lineStyle != '' ? lineStyle : '' %>">
                    </li>
                </ul>
            </div>
        </div>
        <div data-ani-panel class="c-tables-panel-panels-wraper">
            <!-- 设置panel插槽 -->
            <% for(var i = 0; i < panels.length; i ++){%>
            <div class="c-tables-panel-panel" ref="<%= panels[i].ref %>" slot="<%= panels[i].slot %>">
            </div>
            <% } %>
        </div>
    </div>

    同时需要在当前页面的根路径创建build.data.js文件，输出每个需要动态渲染组件的配置参数：（其中数据的key与每个组件的ref值一一对应）

    <!-- 文件路径 -->
    modules/index/build.data.js

    <!-- 文件内容 -->
    module.exports = {
        tabPanel: {
            titleHeight:'5rem',
            tabWidth:'33.333%',
            lineStyle:'background-color:#23bb90;',
            tabs: [{
                slot: 'tab1',
                ref: 'tab1',
            }, {
                slot: 'tab2',
                ref: 'tab2',
            }, {
                slot: 'tab3',
                ref: 'tab3',
            }],
            panels: [{
                slot: 'panel1',
                ref: 'panel1',
            }, {
                slot: 'panel2',
                ref: 'panel2',
            }, {
                slot: 'panel3',
                ref: 'panel3',
            }]
        },
        tab1:{
            title:'我是标题1'
        },
        tab2:{
            title:'哈哈标题2'
        },
        tab3:{
            title:'标题3'
        },
    }
    注意：此配置文件只有打包时才会调用，因此热更新不会生效。



七、组件间通信
    
    1、父--->子 组件通信

        可通过调用组件实例的set方法，修改子组件defaults内定义的参数。同时，子组件内应该在watcher方法内，定义对应数据项改变后的处理方法。例：
        
        子组件：
    
        class xxx extends Component {
            constructor(options) {
                    let defaults = {
                        html: Html,
                        serverSide: false,
                        parameters: {},
                        testData: 'xxx'                 //定义数据或参数项
                    }
                    $.extend(defaults, options);
                    super(defaults);
                }
                watcher() {
                    return {
                        testData: (value) => {          //添加对应数据项改变后的回调方法
                            console.log('-----data change from parent----:', value);
                        }
                    }
                }
        }

        父组件：

        this.children.xxx.set('testData', 'hi this is new value!'); //触发子组件内对应数据的修改，并触发对应的watcher方法。
        或
        Components.$refs.xxx.set('testData', 'hi this is new value!');

        注意：

            1、直接父子组件间通过 this.children.xxx.set 或 Components.$refs.xxx.set 方式通信皆可；
            2、非直接父子组件只能通过 Components.$refs.xxx.set 的方式通信


    2、子--->父 组件通信

        子组件与父组件通信，通过事件的方式进行。父组件先通过this.on(eventName,func)函数注册对应的事件方法，
        子组件通过this.emit(eventName,data)函数触发父组件内对应的事件进行通信。例：
        
        父组件：

        this.on('helloWorldChange', (data) => {                 //注册名为helloWorldChange的事件
            console.log('--------event from child ---:', data)
        });

        子组件:

        this.emit('helloWorldChange','this is tom ,nice to meet u!');   //触发父组件内注册的helloWorldChange的事件

        注意:
        
            1.必须是通过children参数实例化的父子组件才可以通过此方式通信，
        
            2.必须先注册监听事件，再触发，才有效。


    3、跨组件通信

        跨组件通信，通过事件总线的方式进行。先注册总线事件，然后再触发对应的总线事件，即可完成通信。 例：

        组件A：

        import Bus from 'utils/bus';
        Bus.on('eventName', (data) => {
            handler...
        });

        组件B：

        import Bus from 'utils/bus';
        Bus.emit('eventName',data);

        注意：
        
            1、总线通信时，传输的数据是浅拷贝。

            2、必须先注册监听事件，再触发，才有效。

            3、单页应用，在路由切换时，会自动清空当前路由下的所有总线事件队列。

八、未完事项
    暂无

九、示例代码介绍

十、z-index 属性规范

    1、弹出层 1000-2000
    2、loading 2000-3000
    3、toast 3000-4000
    4、页内元素 0-1000
