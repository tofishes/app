/**
 * @author tofishes
 * @version 1.0
 * @description jQuery下拉列表插件
 * @example
 * <div class="dropdown">
 *     <p class="dropdown-show-wrap">
 *         <span class="dropdown-showw">苹果</span>
 *     </p>
 *     <ul class="dropdown-list">
 *         <li class="active">苹果</li>
 *         <li>橘子</li>
 *         <li>香蕉</li>
 *     </ul>
 * </div>
 * <script>
 * $('.dropdown').dropdown();
 * </script>
 *
 * @see http://demo.cssor.com/dropdown/
 */
!function(win, $) {
    var namespace = '.dropdown-list'
    ,   clickEvent = 'click' + namespace

    ,   active = 'active'

    ,   $wrapes = $()
    ,   lists = [];

    //3 parts: 1、global 2、show 3、list
    $.fn.dropdown = function (opts) {
        opts = $.extend({
            'show': '.dropdown-show', // 显示文字的容器
            'list': '.dropdown-list', // 下拉列表容器
            'item': 'li', // 下拉列表单项项目
            'onselect': function ($selected, $show) {} // 选中后的回调，可以返回字符串作为显示文字
        }, opts);

        $wrapes = $wrapes.add(this);
        lists.push(opts.list);

        return this.each(function () {
            var $this = $(this)
            ,   $list = $this.find(opts.list)
            ,   $show = $this.find(opts.show);

            function toggle() {
                // 去掉这里的注释，多个下拉就会互斥，始终只存在一个下拉
                // $wrapes.not($this).removeClass(active);
                // $(lists.join(',')).not($list).hide();

                $this.toggleClass(active);
                $list.toggle();
            }

            $this.on(clickEvent, function (e) {
                toggle();
                e.stopPropagation();

            }).on(clickEvent, opts.item, function (e) {
                var $this = $(this);
                $this.addClass(active).siblings().removeClass(active);

                var show = opts.onselect($this, $show) || $this.text();
                $show.html(show);
            });

            // 初始化
            var $items = $this.find(opts.item)
            ,   $defaultItem = $items.filter('.' + active);

            if (!$defaultItem.length) $defaultItem = $items.eq(0);
            $defaultItem.trigger(clickEvent);
            toggle();
        });
    };

    // 点空白处消失
    $(win.document).off(clickEvent).on(clickEvent, function (e) {
        $wrapes.removeClass(active);
        $(lists.join(',')).hide();
    });
}(this, jQuery);