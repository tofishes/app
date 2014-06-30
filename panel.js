define('panel', function (require, exports, module) {
    /* widget defined */
    // 各种面板类型的祖宗, 定义了面板基本属性和方法
    function Panel() {
        this.$panel; // 必须由实例配置覆盖，面板全局容器，包含关闭按钮在内
        this.$container; // 必须由实例配置覆盖， 面板内容容器
        this.$title; // 必须由实例配置覆盖，面板标题容器

        this.offHook = '.panel-off'; // 关闭的类
        this.onStatus = 'panel-is-activity'; // 打开的状态

        this.initActions = $.Callbacks(); // 初始化面板要触发的行为
        this.onActions = $.Callbacks(); // 打开面板时要触发的行为, 例如：定义如何打开面板
        this.offActions = $.Callbacks(); // 关闭面板时要触发行为, 例如：定义如何关闭面板
    };
    Panel.prototype.config = function (options) {
        for (var name in options) {
            this[name] = options[name];
        };

        return this;
    };
    // 考虑用于异步载入资源，比如样式，模板等，同时也可以加入一次性的事件绑定
    Panel.prototype.init = function () {
        var _this = this;

        this.$panel.on('click', this.offHook, function () {
            _this.off();
        });
        this.initActions.fire.call(this, this.$container);
    };
    Panel.prototype.title = function (title) {
        this.$title.html(title || '');

        return this;
    };

    Panel.prototype.on = function (fn) {
        fn && fn.call(this, this.$container);

        if (!this.isOn()) {
            this.$panel.addClass(this.onStatus);
            this.onActions.fire.call(this);
        };
    };
    Panel.prototype.isOn = function () {
        return this.$panel.hasClass(this.onStatus);
    };
    Panel.prototype.off = function (fn) {
        this.$panel.removeClass(this.onStatus);
        this.offActions.fire.call(this);

        fn && fn.call(this, this.$container);
    };

    // 形成第一个面板类型： FlyPanel ，特点是固定在页面底部，上拉展开，下拉关闭
    var FlyPanel = new Panel();
    FlyPanel.config({
        '$container': $('#fly-panel-con'),
        '$panel': $('#fly-panel'),
        '$title': $('#fly-panel-title')
    });
    FlyPanel.onActions.add(function ($container) {
        this.$panel.slideDown();
    });
    FlyPanel.offActions.add(function ($container) {
        this.$panel.slideUp();
    });
    $(function () {
        FlyPanel.init();
    });

    exports.FlyPanel = FlyPanel;
});