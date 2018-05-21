// login.html
var Login = (function () {
    function Login() {
        // 清空localstorage中的用户信息
        _set("userInfo", "");
        _set("orgInfo", "");
        // 重载安卓系统的返回, 双击间隔小于1秒则退出
        if ('Android' == plus.os.name) {
            var firstClickTimestamp_1;
            mui.back = function () {
                if (!firstClickTimestamp_1) {
                    firstClickTimestamp_1 = (new Date()).getTime();
                    mui.toast("再按一次退出应用");
                    setTimeout(function () {
                        firstClickTimestamp_1 = null;
                    }, 1000);
                }
                else {
                    if ((new Date()).getTime() - firstClickTimestamp_1 < 1000) {
                        plus.runtime.quir();
                    }
                }
            };
        }
        // 关闭前一页面，防止滑动页面退回
        window.addEventListener("closeBoot", function () {
            // 关闭boot页面
            plus.webview.close(plus.webview.getLaunchWebview());
            // 关闭index页面
            plus.webview.close(plus.webview.getWebviewById("index"));
        });
        // 获取当前webview页面对象，其中包含登陆类型信息
        this.wb = plus.webview.currentWebview();
        //预加载页面
        mui.init({
            preloadPages: [{
                    url: '../index.html',
                    id: 'index'
                }],
        });
    }
    Login.prototype.start = function () {
        var vm = new Vue({
            el: "#login",
            data: {
                loginType: 'personal',
                nameTag: "手机或身份证登录",
                name: '',
                pswd: '',
                year: _now().split('-')[0],
                years: [],
                loginAtOnce: true,
            },
            watch: {
                loginType: function (i) {
                    // 切换登陆类型时，提示文字也相应改变
                    this.nameTag = "personal" === i ? "手机或身份证登录" : "组织代码";
                },
            },
            methods: {
                openIndex: function () {
                    // 打开index.html
                    mui.fire(plus.webview.getWebviewById("index"), "updateFooterInfo");
                    openWindow("../index.html", "index");
                    plus.webview.close(plus.webview.currentWebview());
                },
                chooseYear: function () {
                    var _this = this;
                    // 选择登陆年度
                    plus.nativeUI.actionSheet({
                        title: "年度选择",
                        cancel: "取消",
                        buttons: _map(function (i) {
                            return {
                                title: i.year,
                                server: i.server
                            };
                        }, this.years)
                    }, function (e) {
                        if (0 === e.index)
                            return;
                        _this.year = _this.years[e.index - 1].year;
                        // 年份存储到本地
                        _set("year", _this.year);
                        // 设置年度数据服务接口
                        _callAjax = _genCallAjax(_this.years[e.index - 1].server + "/db4web");
                    });
                },
                login: function () {
                    var _this = this;
                    // 防止重复点击
                    if (!this.loginAtOnce)
                        return;
                    // 去掉登录名与密码的空格
                    var name = _trim(this.name), pswd = _trim(this.pswd);
                    if (!name || !pswd)
                        return mui.toast("请完整填写登陆信息");
                    // 防止重点击
                    this.loginAtOnce = false;
                    // 个人登陆
                    var sql = "select u.id,u.name,u.img,u.orgName,u.orgNo,u.pswd,o.id as orgId from User u, organization o where (idno = ? or phone = ?) and u.pswd= ? and u.orgNo = o.no and u.ifValid >= 1", vals = _dump([name, name, pswd]);
                    // 组织登陆
                    if ("organization" === this.loginType) {
                        sql = "select id, name, pswd, img, no, secretary, type from organization where no = ? and pswd = ?";
                        vals = _dump([name, pswd]);
                    }
                    // 登陆
                    _callAjax({
                        cmd: "fetch",
                        sql: sql,
                        vals: vals
                    }, function (d) {
                        if (d.success && d.data && d.data.length) {
                            _set("personal" === _this.loginType ? "userInfo" : "orgInfo", _dump(d.data[0]));
                            setTimeout(function () {
                                _this.openIndex();
                            }, 500);
                        }
                        else {
                            // 恢复按钮可点击
                            _this.loginAtOnce = true;
                            mui.toast("登录失败");
                        }
                    });
                },
                forgetPswd: function () {
                    openWindow("forget.html", "forget");
                }
            },
            mounted: function () {
                var _this = this;
                // 获取年度服务接口
                _callAjax({
                    cmd: "fetch",
                    sql: "select year, server from yearServerConfig"
                }, function (d) {
                    if (d.success && d.data && d.data.length) {
                        _this.years = d.data;
                    }
                });
            }
        });
    };
    return Login;
}());
if (window.plus) {
    (new Login).start();
}
else {
    document.addEventListener('plusready', function () {
        (new Login).start();
    }, false);
}
