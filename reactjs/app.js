/** @jsx React.DOM */

// 一个router对应一个action
// 如果不同action直接有共同的异步数据，则可以提取为actionHelper
// Router('/list/:id/:page')
var app = require('app');

app.rounter({
    '/list/:id/:page': 'listAction', // or '/list/:id-:page'
    '/detail/:id': 'detailAction'
})
app.setDefault({
    'pageDOMNode': document.body
})
app.helper({
    'getListData': function () {}
});


var ListPage = require('list-page.jsx')
var listAction = app.createAction({
    async: function(request) {
        var route = request.route; // '/list/10/1'
        var params = request.query; // {'id': 10, 'page': 1}

        $.get('/list', params, function (data) {
            pageContext.listdata = data;

            // pageContext[componentName]
        })
        app.helper.getListData(request);
    },
    response: function () {
        return renderPage(ListPage)
    }
});

app.renderPage(Page) {
    React.renderComponent(<Page componentName="page" />, app.pageDOMNode);
}

/**
 * 实现 App, Action, Rounter 三大类
 * 默认视图： DefaultView 负责page的创建销毁，返回一个默认<Page/>视图
 * application(localStorage), session(sessionStorage), request(一个Rounter周期), page（一个默认视图周期） 4个内置对象
 */
function prototype(_class, protos) {
    for (var proto in protos) {
        _class.prototype[proto] = protos[proto];
    }
}
function setObject(object, options) {
    for (var key in options) {
        object[key] = options[key];
    }
    return object;
}
function App() {}
prototype(App, {
    setDefault: function (options) {
        return setObject(this, options);
    },
    helper: function (helpers) {
        setObject(this.helper, helpers);

        return this;
    },
    route: function (routers) {
        
    },
    init: function () {
        if (this.hasInited) {
            return this;
        };

        // 初始化，开始监听地址变化，触发路由
        this.hasInited = true;
    }
})