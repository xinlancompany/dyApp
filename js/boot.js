// 启动页
var Boot = (function () {
    function Boot() {
        // 设置桌面应用图标的角标数字
        plus.runtime.setBadgeNumber(0);
        var userStr = _get("userInfo");
        var orgStr = _get("orgInfo");
        if (userStr)
            this.userInfo = _load(userStr);
        if (orgStr)
            this.orgInfo = _load(orgStr);
        this.homeImg = _get("homeImg");
        // 设置默认的启动图
        if (!this.homeImg)
            this.homeImg = 'img/start.jpg';
        if (!this.userInfo && !this.orgInfo) {
            // 如未登陆则预加载login
            mui.preload({
                url: "views/login.html",
                id: "login"
            });
        }
        else {
            // 如已登陆则加载index.html
            mui.preload({
                url: "index.html",
                id: "index"
            });
        }
    }
    Boot.prototype.start = function () {
        var self = this;
        var vm = new Vue({
            el: ".boot",
            data: {
                link: self.homeImg,
                time: 7,
                timeoutCb: null
            },
            computed: {
                startImg: function () {
                    if (this.link.indexOf("data:image") == 0) {
                        return "url('" + this.link + "')";
                    }
                    else {
                        return "url(" + this.link + ")";
                    }
                }
            },
            methods: {
                openIndex: function () {
                    // 跳转后均需要注销boot.html页面
                    if (self.userInfo || self.orgInfo) {
                        // 如登陆则调转至index.html页面
                        openWindow("index.html", "index");
                    }
                    else {
                        // 跳转至登陆页面
                        openWindow("views/login.html", "login");
                    }
                    // 延时关闭本身，防止整个退出
                    //					setTimeout(() => {
                    //						plus.webview.close(plus.webview.currentWebview());
                    //					}, 500);
                    _delayClose(plus.webview.currentWebview());
                    if (this.timeoutCb) {
                        // 停止倒计时
                        clearInterval(this.timeoutCb);
                    }
                }
            },
            mounted: function () {
                var _this = this;
                this.timeoutCb = setInterval(function () {
                    _this.time -= 1;
                    if (_this.time === 0) {
                        _this.openIndex();
                    }
                }, 1000);
                // 获取首页页面
                _callAjax({
                    cmd: "fetch",
                    sql: "select homepage from system"
                }, function (d) {
                    if (d.success && d.data) {
                        _set("homeImg", d.data[0].homepage);
                    }
                });
            }
        });
    };
    return Boot;
}());
if (window.plus) {
    (new Boot()).start();
}
else {
    document.addEventListener('plusready', function () {
        (new Boot()).start();
    }, false);
}
