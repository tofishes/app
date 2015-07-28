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
DATE.parse = function (date) {
    if (!date || date.getDate) {
        return date;
    }

    var metas = date.split(/\D+/)
    ,   monthIndex = 1 // 索引到setMonth方法，需要 减1
    ,   i = 0
    ,   l = metas.length
    ,   date = new Date()
    ,   meta;

    for (; i < l; i++) {
        meta = metas[i];
        if (i == monthIndex) {
            meta -= 1;
        }

        date[dateMethods[i]](meta)
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
    format = format || 'YYYY-MM-dd hh:mm:ss';

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