// 格式化日期全局类
var DATE = {}
,   chineseWeek = ['日', '一', '二', '三', '四', '五', '六']
,   dateMethods = ['setFullYear', 'setMonth', 'setDate', 'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds'];

/**
 * 解析字符串为日期对象
 * @param  {[String]} date 字符串可以是任何非数字字符间隔的 年月日 时分秒
 *                         该字符串应去除首尾空格及其他字符
 * @return {[Date]} 日期对象
 */
function isDate(o){
   return Object.prototype.toString.call(o) === "[object Date]"; //&& o.toString() !== 'Invalid Date' && !isNaN(o);
}
DATE.isDate = isDate

DATE.getTime = function(date){
    var now = date ? DATE.parse(date) : new Date();
    return now.getTime();
}

// 只有一个参数，表示与当前时间对比
DATE.diff = function (date, date_other) {
    if (arguments.length == 1) {
        date_other = date;
        date = new Date();
    }
    date = DATE.parse(date);
    date_other = DATE.parse(date_other);

    return date - date_other;
}
// 只有一个参数，表示与当前时间对比
// 判断date是否大于date_other
DATE.gt = function (date, date_other) {
    return DATE.diff.apply(this, arguments) > 0;
}
// 只有一个参数，表示与当前时间对比
// 判断date是否小于date_other
DATE.lt = function (date, date_other) {
    return DATE.diff.apply(this, arguments) > 0;
}

DATE.parse = function (date) {
    // 是一个Date对象
    if (isDate(date)) {
        return date;
    }
    // 毫秒数
    if (!isNaN(date)) {
        return new Date(+date) // ie8不支持 '12313123123' 字符串形式的毫秒数
    }

    // 以下是字符串
    var metas = date.split(/\D+/)
    ,   monthIndex = 1 // 索引到setMonth方法，需要 减1
    ,   i = 3 // 从小时开始，年月日可以通过setFullYear设置
    ,   l = metas.length
    ,   date = new Date()
    ,   meta;

    if (metas[monthIndex]) {
        metas[monthIndex] -= 1;
    }
    // 单独执行setMonth方法有误，因为setMonth方法不设第二个参数会影响月份正确性
    // 设置年月日
    date.setFullYear.apply(date, metas)
    // 设置时分秒
    for (; i < l; i++) {
        meta = metas[i];
        date[dateMethods[i]](meta);
    }

    return date;
}
/**
 * 格式化日期类
 * @param  {[Date | String]} date 要格式化的日期对象或日期字符串
 * @param  {[type]} format 格式化信息，支持 y(年), M（月）, d（日）, w（周), W(中文周), h（时）, m（分）, s（秒）, S（毫秒）
 * @return {[type]}        [description]
 */
DATE.format = function(date, format) {
    if (!date) return date;

    date = DATE.parse(date);
    format = format || 'yyyy-MM-dd hh:mm:ss';

    var week = date.getDay()
    ,   o = {
        "M+": date.getMonth() + 1,  //month
        "W+": chineseWeek[week],
        'w+': week,
        "d+": date.getDate(),   //day
        "h+": date.getHours(),  //hour
        "m+": date.getMinutes(),    //minute
        "s+": date.getSeconds(),    //second
        //quarter
        "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
        "S": date.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        };
    };

    return format;
};
window.DATE = DATE;

module.exports = DATE;
