/**
 * @tofishes
 * Action定义示例
 * app两种方法：
 * get 定义一个router，并指定handler
 * component 定义一个局部组件响应
 * 
 * @type {[type]}
 */
var GoodsList = require('../views/goods-list.jsx')
,   SideNav = require('../views/side-nav.jsx')

module.exports = function(app) {
    app.get('/goods-list/:id/:page', function (request, response) {
        var params = request.query; // request是包装并扩展了window.location的一个对象
        ,   data = {};

        $.get('/api/goods-list', params, function (res) {
            data = res.data;

            response(GoodsList, data); // view方法内部会查询goods-list-:id-:page标向的component组件实例
        })

        return response(GoodsList, data);
    });

    var html_element = document.querySelector('#side-nav-wrap');
    app.component('side-nav', '#selector' || html_element, function (request, response) {
        // 数据获取初始化类似上面的方法
        var data = this.store({});

        return response(SideNav, data)
    });
}