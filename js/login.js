// login.html
var Login = (function () {
    function Login() {
        var _this = this;
        // 清空localstorage中的用户信息
        mui.init({
            swiperBack: false
        });
        if ("iOS" == plus.os.name) {
            plus.webview.currentWebview().setStyle({
                popGesture: "none"
            });
        }
        _set("userInfo", "");
        _set("orgInfo", "");
        _set("jhInfo", "");
        // 重载安卓系统的返回, 双击间隔小于1秒则退出
        if ('Android' == plus.os.name) {
            mui.back = function () {
                _androidClose(_this);
            };
        }
        // 关闭前一页面，防止滑动页面退回
        window.addEventListener("closeBoot", function () {
            // 关闭boot页面
            plus.webview.close(plus.webview.getLaunchWebview());
            // 关闭index页面
            //			plus.webview.close(plus.webview.getWebviewById("index"));
        });
        // 获取当前webview页面对象，其中包含登陆类型信息
        this.wb = plus.webview.currentWebview();
        //预加载页面
        var idxPage = plus.webview.getWebviewById("index");
        if (!idxPage) {
            this.preloadIndex();
        }
    }
    Login.prototype.preloadIndex = function () {
        mui.preload({
            url: '../index.html',
            id: 'index'
        });
    };
    Login.prototype.start = function () {
        var vm = new Vue({
            el: "#login",
            data: {
                loginType: 'personal',
                nameTag: "手机号码登录",
                name: '',
                pswd: '',
                year: _now().split('-')[0],
                years: [],
                loginAtOnce: true,
                userName: "",
                orgName: "",
                jhName: "",
                timeleft: 0,
                serverCode: "",
                codeTag: "获取验证码",
            },
            watch: {
                timeleft: function (i) {
                    this.codeTag = this.timeleft > 0 ? this.timeleft : "获取验证码";
                },
                loginType: function (i) {
                    // 切换登陆类型时，提示文字也相应改变
                    if ("personal" === i) {
                        this.nameTag = "手机号码登录";
                        this.name = this.userName;
                    }
                    else if ("organization" == i) {
                        this.nameTag = "支部账号";
                        this.name = this.orgName;
                    }
                    else {
                        this.nameTag = "兼合支部账号";
                        this.name = this.jhName ? this.jhName : "";
                    }
                },
            },
            methods: {
                sendCode: function () {
                    var self = this, phone = _trim(self.name);
                    if (this.timeleft > 0)
                        return;
                    if (self.loginType == "personal" && (!phone || phone.length != 11))
                        return mui.toast('请输入正确手机号码');
                    if (self.loginType != "personal" && !phone)
                        return mui.toast('请输入正确支部编号');
                    _pyAjax({
                        cmd: "sendPswd",
                        loginType: self.loginType,
                        no: phone
                    }, function (d) {
                        mui.toast(d.success ? d.data.errMsg : d.errMsg);
                        if (d.success && d.data.success) {
                            self.timeleft = 60;
                            var tm = setInterval(function () {
                                self.timeleft -= 1;
                                if (self.timeleft <= 0)
                                    clearInterval(tm);
                            }, 1000);
                        }
                    }, "/sms");
                },
                openIndex: function () {
                    // 打开index.html
                    openWindow("../index.html", "index");
                    //                  _delayClose(plus.webview.currentWebview(), 2000);
                    mui.fire(plus.webview.getWebviewById("index"), "updateFooterInfo");
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
                loginJh: function (n, p) {
                    var _this = this;
                    // 兼合支部登录
                    _jhAjax({
                        cmd: "zsgaLogin",
                        user: n,
                        pwd: p
                    }, function (d) {
                        if (d.success && d.data) {
                            // 保存登录名
                            _set("jhInfo", _dump(d.data));
                            _set("jhName", n);
                            _set("year", _this.year);
                            setTimeout(function () {
                                _this.openIndex();
                            }, 500);
                            // 设置分数
                            _set("score", _dump({
                                score: 0,
                                date: "0000-00-00"
                            }));
                        }
                        else {
                            // 恢复按钮可点击
                            _this.loginAtOnce = true;
                            mui.toast("登录失败");
                        }
                    }, "/db4web");
                },
                verify: function () {
                    var _this = this;
                    // 防止重复点击
                    if (!this.loginAtOnce)
                        return;
                    // 去掉登录名与密码的空格
                    var name = _trim(this.name), pswd = _trim(this.pswd);
                    if (!name || !pswd)
                        return mui.toast("请完整填写登录信息");
                    _pyAjax({
                        cmd: "verifyCode",
                        name: name,
                        code: pswd,
                        loginType: this.loginType
                    }, function (d) {
                        if (d.success && d.data) {
                            var pswd_1 = decryptData(d.data.data.split("\n").join(""));
                            _this.login(name, pswd_1);
                        }
                        else {
                            mui.toast(d.errMsg);
                        }
                    }, "/sms");
                },
                login: function (name, pswd) {
                    var _this = this;
                    // 防止重点击
                    this.loginAtOnce = false;
                    // 兼合登录
                    if (this.loginType == "jh")
                        return this.loginJh(name, pswd);
                    // 个人登陆
                    var sql = "select u.id,u.name,u.img,u.idNo,u.phone,u.orgName,u.orgNo,u.pswd,o.id as orgId from User u, organization o where (u.idno = ? or u.phone = ?) and u.pswd= ? and u.orgNo = o.no and u.ifValid >= 1", vals = _dump([name, name, pswd]);
                    // 组织登陆
                    if ("organization" === this.loginType) {
                        sql = "select id, name, pswd, img, no, secretary, type from organization where no = ? and pswd = ? and ifValid >= 1";
                        vals = _dump([name, pswd]);
                    }
                    _callAjax({
                        cmd: "fetch",
                        sql: sql,
                        vals: vals
                    }, function (d) {
                        if (d.success && d.data && d.data.length) {
                            _set("personal" === _this.loginType ? "userInfo" : "orgInfo", _dump(d.data[0]));
                            // 保存登录名
                            _set("personal" === _this.loginType ? "userName" : "orgName", name);
                            _tell(d.data[0]);
                            _set("year", _this.year);
                            setTimeout(function () {
                                _this.openIndex();
                            }, 500);
                            // 设置分数
                            _set("score", _dump({
                                score: 0,
                                date: "0000-00-00"
                            }));
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
                },
                openGuide: function () {
                    //
                    openOutlink("http://zsdy02.wifizs.cn/pdfviewer/web/viewer.html?file=http://zsdy02.wifizs.cn/jhszb/舟山共产党员E家兼合式支部APP端使用说明.pdf", "使用指南");
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
                // 用户名
                this.userName = _get("userName");
                this.orgName = _get("orgName");
                this.jhName = _get("jhName");
                // 设置用户名
                if (this.loginType === "personal") {
                    this.name = this.userName;
                }
                else if (this.loginType == "organization") {
                    this.name = this.orgName;
                }
                else {
                    // 兼合支部
                    console.log("rth");
                    this.name = this.jhName;
                }
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
// 添加清理缓存的事件，备用
//document.addEventListener("clearCache", () => {
//	_set("userInfo", "");
//	_set("orgInfo", "");
//}); 
