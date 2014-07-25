define('app', ['jquery'], function ($) {
    // @tofishes 定义一个app对象，建立基础行为和属性
    // 依赖： jQuery
    function app($container) {
        this.templates = this.getTemplates($container);
        this.$doms = this.getDoms($container);

        this.assets = []; // 可以通过Ajax预载入的资源集合
        this.api_pre = ''; // 设置一个接口的统一前缀

        this.initActions = $.Callbacks(); // 初始化时 需要预先执行的一些函数
    };

    /* 批量配置app一些属性 */
    app.prototype.config = function (options) {
        for (var name in options) {
            this[name] = options[name];
        };

        return this;
    };
    // 处理多个接口地址，加上配置的URL前缀
    // uri 是统一资源标识符缩写
    app.prototype.uri = function (uriMap) {
        for (var url in uriMap) {
            uriMap[url] = this.api_pre + uriMap[url];
        };

        return uriMap;
    };
    // 获取单个接口地址
    app.prototype.getURI = function (uri) {
        return this.api_pre + uri;
    };
    // 添加一个预载入资源地址，及可选的载入后回调
    // fn作为回调，可以取到3个参数，第一个参数是data，第二个参数是字符串：success或error等，第三个参数是xhr
    app.prototype.addURL = function (url, fn) {
        var assetMap = {};
        assetMap[url] = fn;

        return this.addAsset(assetMap);
    };
    // 一次添加多个预载入资源，形式为： { url: callback}
    // callback能获取到的参数同addURL的fn
    app.prototype.addAsset = function (assetMap) {
        _extend_(this.assets, assetMap);
        return this;
    };

    // 获取页面中可以预编译的模板
    // 例如 script[data-name=模板名]
    app.prototype.getTemplates = function ($container) {
        return $.extend(this.templates || {}, extractTmpl($container));
    };
    // 获取页面中预定义的jQuery dom对象
    // 例如： div.predefined[data-name=对象名]
    app.prototype.getDoms = function ($container, predefinedClassName) {
        return $.extend(this.$doms || {}, extractPredefined($container, predefinedClassName));
    };

	app.prototype.init = function () {
        var _this = this
        ,   $xhrs = []
        ,   urls = []
        ,   url
        ,   all
        ,   fn;

        for (url in this.assets) {
            $xhrs.push($.ajax(url, {duplicate: true}));
            urls.push(url);
        };

        all = $.when.apply(this, $xhrs);
        all.always(function () {
            // 单个请求，只需要取arguments即可
            // 多个请求arguments是双维数组
            // 统一arguments格式
            var args = arguments;
            if (urls.length === 1)
                args = [arguments]; // apply方法接受的是一个数组或类数组参数

            for (var i = 0; i < urls.length; i++) {
                fn = _this.assets[urls[i]];
                fn && fn.apply(_this, args[i]);
            };

            _this.initActions.fire();
        });

        return this;
    };

    /* 封装第三方方法，方便统计接口。
        封装方法统一使用前后下划线的格式命名： _funcname_
     */
    function _extend_() {
        return $.extend.apply($, arguments);
    };
    /* 提取页面中拥有data-name属性的模板并预编译 */
    function extractTmpl($container) {
        $container = $container || $(document);
        var templates = {}
        ,   names = []
        ,   $scripts = $container.find('script');

        $scripts.each(function () {
            var name = $(this).data('name')
            ,   id = this.id;

            if (name) {
                templates[name] = $(this).template();
                names.push(name);
            };
        });

        window.console && console.info('模板名有： ' + names.join());

        return templates;
    };
    // 提取页面中class属性中挂有predefined，并且拥有data-name属性的dom对象，返回的是jQuery对象
    function extractPredefined($container, predefinedClassName) {
        predefinedClassName = predefinedClassName || 'predefined';
        $container = $container || $(document);
        var predefined = {}
        ,   names = []
        ,   $predefined = $container.find('.' + predefinedClassName)
        ,   name;

        $predefined.each(function () {
            name = $(this).data('name');
            predefined[name] = $(this);
            names.push(name);

            !name && window.console && console.info('未设置data-name: ', $(this));
        });

        window.console && console.info('预定义jQuery DOM对象变量名有： ' + names.join());

        return predefined;
    };

    // 用于对象继承的方法
    // http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance.html 的方法不能继承属性，好坑
    app.prototype.inherit = function (child, parent) {
        // var F = function(){};
        // F.prototype = parent.prototype;
        // child.prototype = new F();
        child.prototype = new parent();
        child.prototype.constructor = child;
        // child.uber = parent.prototype;
    };

    // 设置全局ajax参数
    $.ajaxSetup({
        cache: false,
        scriptCharset: 'utf-8',
        dataType: 'json',
        data: {}, // 默认参数
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        // @tofishes, add unok status tip
        statusCode: {
            500: function() {
                sys.warn('服务器错误(500), 请稍后重试! ');
            },
            503: function() {
                sys.warn('服务器繁忙(503)，请刷新重试！');
            },
            504: function() {
                sys.warn('请求超时(504)，请刷新重试！');
            },
            403: function() {
                sys.warn('无权限(403), 请尝试重新授权！');
            }
        }
    });

    // 获取表单域的值，返回集合后的对象
    // 例如两个表单项目：
    // <div id="ab">
    // <input name="a" value="1">
    // <input name="a" value="2">
    // </div>
    // 则调用：
    // var map = $('#ab').serializeMap();
    // console.info(map);
    // 打印结果为：
    // {a: 1， b: 2}
    $.fn.serializeMap = function () {
        var map = {}
        ,   serializeArray = this.serializeArray()
        ,   i = 0
        ,   input;

        for (; i < serializeArray.length; i++) {
            input = serializeArray[i];
            map[input.name] = input.value;
        };

        return map;
    };

    return app;
});