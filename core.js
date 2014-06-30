/* @tofishes */
// 1、自动载入和html同名的css和js
// 2、自动载入公共css
// 其他的js和css，tmpl等依赖通过require自行在js中管理
;function pageInfo() {
    var path = location.pathname
    ,   pageId
    ,   pageName

    ,   dotPos
    ,   lastSlashPos

    ,   defaultPage = 'index'; // 暂不处理多个/的情况

    if (path == '/') {
        pageName = pageId = defaultPage;
    } else {
        dotPos = path.indexOf('.') || path.length;
        lastSlashPos = path.lastIndexOf('/');

        pageName = path.substring(lastSlashPos + 1, dotPos); // +1， 不包含第一个 /
        pageId = path.substring(1, dotPos).replace(/\//g, '-'); // 从1开始，去掉第一个 /
    };

    return {
        'path': path,
        'pageId': pageId,
        'pageName': pageName
    };
};

// 封装模块载入API
// 可用的api参考如下，用法接近seajs
// var module = {
//     'config': function () {}, // seajs用法，requirejs封装为此用法
//     'use': function () {},  // seajs用法， requirejs封装为此用法
//     'package': function (module, moduleName) {} // 新增方法，模块封装转换器, 传入要转换的模块对象，和模块名
// }
// ,   define = function () {} // 通用用法
// ,   require = function () {} // 全局方法，requirejs用法，seajs.require被封装为此用法

;(function (window, undefined) {
    var pageInfo = window.pageInfo();

    module.config({
        base: '/assets/js', // for requirejs
        paths: {
            'css': '../css'
        },
        alias: {
            'jquery': 'lib/jquery-1.8.1.min'
        },
        map: {
          '*': {
            'css': 'css.min' // or whatever the path to require-css is
          }
        },
        urlArgs: 'v=0.0.3' // 控制缓存，考虑改成 'v=@KM_VERSION',然后grunt编译替换@KM_VERSION
    });

    // , '/assets/css/page/index.css'
    var defaultAssets = ['page/' + pageInfo.pageName]

    module.use(['css!../css/page/' + pageInfo.pageName]);

    module.use(['jquery', 'app', 'kws', 'util', 'sys', 'emoji'], function ($, app, kws, util, sys, emoji) {

        // 载入page同名资源
        module.use(defaultAssets);
        window.kws = kws;
        window.util = util;
        window.sys = sys;
        window.jEmoji = emoji;

        sys.loading();
        kws.initActions.add(function () {
            sys.loaded();
        });
        kws.init();

        // 高亮导航
        $('#nav .page-' + pageInfo.pageName).addClass(kws.ACTIVECLASS);
    });
})(this);
