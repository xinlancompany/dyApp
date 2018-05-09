//预加载页面
mui.init({
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var login = new Vue({
		el: '#login',
		data: {
            type: 'personal',
            usernameTag: "手机号或身份证号登录",
			username: '',  //账号
			password: '',  //密码
			year: _now().split("-")[0], // 年份
			yearId: 0,
			years: []
		},
		watch: {
			type: function(i) {
				this.usernameTag = i == "personal" ? "手机号或身份证号登录" : "组织代码";
			}
		},
		methods: {
			openIndex: function() {
				mui.fire(plus.webview.getWebviewById('index'), 'loginBack', {
					tp: ""
				});
			
				setTimeout(function() {
					openWindow("../index.html", "index");
				}, 1500);
			},
			// 选择年份
			chooseYear: function() {
                var self = this,
                    buttons = _map(function(i) {
                        return {
                            title: i.year,
                        };
                    }, self.years);
                plus.nativeUI.actionSheet({
                    title: "年份选择",
                    cancel: "取消",
                    buttons: buttons
                }, function(e) {
                    if (e.index == 0) return;
                    self.year = self.years[e.index-1].year;
                    self.yearId = e.index-1;
                });
			},
			//登录
			login:function(){
                // alert(this.type);
				var self = this,
                    name = _trim(self.username),
                    pswd = _trim(self.password);
                if (!name || !pswd) return mui.toast("请填写登陆信息");
			
				//如果是党员
				if(self.type == "personal"){
					_callAjax({
						cmd: "fetch",
						sql: "select u.id,u.name,u.img,u.orgName,u.orgNo,u.pswd,o.id as orgId from User u, organization o where (idno = ? or phone = ?) and u.pswd= ? and u.orgNo = o.no and u.ifValid >= 1",
						vals: _dump([name, name, pswd])
					}, function(d) {
						if(d.success && d.data && d.data.length) {
							mui.toast(d.data[0].name + "，欢迎登陆!");
							
							var userInfo = d.data[0];
							userInfo.userType = 0; // 个人登陆
							_set('userInfo',_dump(userInfo));
							_set('year', self.year)
						
							mui.fire(plus.webview.getWebviewById('index'), 'loginBack', {
                                tp: "person"
                            });
						
							setTimeout(function() {
								openWindow("../index.html", "index");
							}, 1500);

							// 重置服务器
							var _callAjax = _genCallAjax(self.years[self.yearId].server + "/db4web");
						} else {
							mui.toast("个人账号登录失败")
                        }
					});
				} else {
					//如果是组织
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, pswd, img, no, secretary, type from organization where no = ? and pswd = ?",
						vals: _dump([name, pswd])
					}, function(d) {
						if (d.success && d.data && d.data.length) {
							mui.toast(d.data[0].name+"，欢迎登陆");
					
							var userInfo = d.data[0];
							userInfo.userType = 1; // 组织登陆
							_set('userInfo', _dump(userInfo));
							_set('year', self.year)
					
							mui.fire(plus.webview.getWebviewById('index'), 'loginBack', {
                                tp: "organization"
                            });
					
							setTimeout(function() {
								openWindow("../index.html", "index");
							}, 1500);
						} else {
							mui.toast("组织账号登录失败");
						}
					});
				}
			},
			forgetPswd: function() {
				openWindow("forget.html", "forget");
			},
			userTypeChange: function(t) {
				this.type = t;
			}
		},
		mounted: function() {
			var self = this;
		}
	});

	_callAjax({
		cmd: "fetch",
		sql: "select year, server from yearServerConfig"
	}, function(d) {
		if (d.success && d.data) {
			login.years = d.data;
		}
	});

    var wb = plus.webview.currentWebview();
    if ("type" in wb) {
        login.type = wb.type;
    }

    // 关闭boot
    window.addEventListener("closeBoot", function() {
        plus.webview.close(plus.webview.getLaunchWebview());
        plus.webview.close(plus.webview.getWebviewById("index"));
    });

	// 重载安卓返回
	if('Android' == plus.os.name) {
		var first = null;
		mui.back = function() {
			if(!first) {
				first = new Date().getTime();
				mui.toast('再按一次退出应用');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if(new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		}
	}

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

