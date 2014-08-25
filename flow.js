/**
 * 单程双向工作流
 * @author tofishes
 * @chainable
 * @example
var flow = new Flow(), j = 0;
flow.next(function() {
    j++;
    console.info('j : ' + j);
}).next(function() {
    if (j > 2) {
        console.info('j = ' + j, ' 继续下一步')
        setTimeout(function(){
          _this.nextStep();
        }, 1000)
    } else {
        console.info('j = ' + j, ' 返回上一步')
        this.prevStep();
    }
}).next(function () {
    console.info('j理应为3，实际 j = ' , j);
}).done();
 */
define(function (require, exports, module) {
    function prototype(_class, protos) {
        for (var proto in protos) {
            _class.prototype[proto] = protos[proto];
        }
    }

    function Flow() {
        this.actions = [];
        this.data = [];
        this.stepIndex = 0;
    }

    function isWaiting(action) {
        var _action = action.toString();
        return _action.indexOf('.nextStep()') != -1
             || _action.indexOf('.prevStep()') != -1
             || _action.indexOf('.waiting()') != -1;
    }

    prototype(Flow, {
        'start': function (action) {
            return this.next.apply(this, arguments);
        },
        'next': function (action) {
            action = action || function () {};
            this.actions.push(action);

            return this;
        },
        'done': function (finish) {
            this.next.apply(this, arguments);
            // 启动工作
            return this.work();
        },
        'work': function () {
            var i = this.stepIndex
            ,   actions = this.actions
            ,   l = actions.length;

            for (; i < l; i++) {
                // 保存可能返回的数据
                // 如果是异步，则需要调用者自行使用store方法存储数据
                this.store(actions[i].call(this, i, this.data));
                this.stepIndex = i + 1; // ??为啥等于i + 1

                if (isWaiting(actions[i])) {
                    this.stepIndex = i; // ??为啥等于i
                    break;
                }
            }
            return this;
        },
        'store': function (data) {
            // 直接调用store而不传参数，则为获取数据
            if (arguments.length === 0) {
                return this.data[this.stepIndex];
            }
            // 传递data参数，则保存数据
            this.data[this.stepIndex] = data;
        },
        'nextStep': function () {
            this.stepIndex ++;
            return this.work();
        },
        'prevStep': function () {
            this.stepIndex --;
            return this.work();
        },
        'waiting': function () {}
    });

    return Flow;
});