/**
 * @author tofishes
 * 本地存储的封装，包含sessionStorage
 * @example
 * var storage = new Storage();
 * var seesion = new Storage('session'); // session作用域
 * storage.set('a', 111) // 存储，同时存入一个时间戳或指定的版本号
 * storage.set('a', 111, 'v1.1.2') // 存储, 带版本号
 * storage.setExpired('a', '2015-10-11 14:20:25') // 设置a过期时间
 * storage.get('a') // 获取，输出111
 * storage.list();  // 返回当前已存储的内容
 * storage.remove('a'), // 移除a
 * storage.clear(); // 清空存储
 * storage.storeTime('a'), // 返回a存入时候的时间戳或指定的版本号，用于缓存比较
 * storage.removeStoreTime('a') 移除a存入的时间
 */
;(function (global) {
    var storeTimeName = 'storage-time'
    ,   expireTimeName = 'expire-time'
    ,   one_day = 24 * 60 * 60 * 1000;

    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    function setStorage(name, value) {
        return this.storage.setItem(name, JSON.stringify(value));
    };
    function getStorage(name) {
        var value = this.storage.getItem(name);
        try {
            value = JSON.parse(value); // 防止解析错误
        } catch(e) {}
        
        return value;
    };
    function prototype(_class, protos) {
        for (var proto in protos) {
            _class.prototype[proto] = protos[proto];
        }
    };
    /**
     * Storage本地存储类
     * @param {[String]} type  'session' | null 存储类型，选填，默认为localStorage
     */
    function Storage(type) {
        this.storage = type === 'session' ? window.sessionStorage
                                          : window.localStorage ;
        if (!this.storage) {
            throw new ReferenceError('can\'t find localStorage or sessionStorage');
        }

        this.Time = getStorage.call(this, storeTimeName) || {};
        this.Expires = getStorage.call(this, expireTimeName) || {};
    }

    prototype(Storage, {
        set: function(name, value, version) {
            this.Time[name] = version || Date.now();
            setStorage.call(this, storeTimeName, this.Time);
            setStorage.call(this, name, value);

            return this;
        },
        get: function (name) {
            // 过期检查并自动清理
            this.expire();
            return getStorage.call(this, name);
        },
        setExpired: function (name, date) { // 设置有效期多少天
            date = date.replace(/\-/g, '/');
            var expireTime = new Date(date).getTime();

            if (!expireTime) {
                return window.console && console.error('Error: 设置过期时间错误，无法转为正确时间');
            }

            this.Expires[name] = expireTime;

            setStorage.call(this, expireTimeName, this.Expires)
        },
        expire: function () {
            var name
            ,   now = Date.now()
            ,   hasExpired = false;

            for (name in this.Expires) {
                if (now > this.Expires[name]) {
                    this.remove(name);
                    delete this.Expires[name];
                    hasExpired = true;
                }
            }
            hasExpired && setStorage.call(this, expireTimeName, this.Expires);
        },
        list: function () {
            var l = this.storage.length
            ,   i = 0
            ,   list = {}
            ,   name;

            for (; i < l; i++) {
                name = this.storage.key(i);
                list[name] = this.get(name);
            }
            return list;
        },
        remove: function (name) {
            this.removeStoreTime(name);
            this.storage.removeItem(name);

            return this;
        },
        clear: function () {
            this.storage.clear();
            this.Time = {};
            this.Expires = {};

            return this;
        },
        storeTime: function(name) {
            return this.Time[name]; //getStorage.call(this, storeTimeName)[name];
        },
        removeStoreTime: function(name) {
            // this.Time = getStorage.call(this, storeTimeName) || {};
            delete this.Time[name];
            setStorage.call(this, storeTimeName, this.Time);
            
            return this;
        }
    });

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define(function () {
            return Storage;
        });
        return;
    };
    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Storage;
        return;
    };

    global.Storage = Storage;
})(this);