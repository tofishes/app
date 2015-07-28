/**
 * 重写React.createClass方法
 * 扩展功能：
 * 1、可以设置组件属性componentName，作为该组件标识
 * 2、将设置了componentName的组件引用存储到pageContext对象，以达到组件通信的作用
 *
 * @author tofishes
 * @
 * @type {[type]}
 */
var _creatClass = React.createClass;
var _page = typeof pageContext != 'undefined' ? pageContext
                                              : this;

React.createClass = function (options) {
    var _getInitialState = options.getInitialState || function () {}
    ,   _componentWillUnmount = options.componentWillUnmount || function () {};

    // 存储组件引用
    options.getInitialState = function () {
        var componentName = this.props.componentName;

        if (componentName) {
            _page[componentName] = this;
        }

        return _getInitialState.call(this);
    };

    // 销毁组件引用
    options.componentWillUnmount = function () {
        var componentName = this.props.componentName;

        if (componentName) {
            delete _page[componentName];
        }

        return _componentWillUnmount.call(this);
    }

    return _creatClass.call(this, options);
};