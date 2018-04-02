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
						sql: "select id,name,img,orgName,orgNo,pswd from User where (idno = ? or phone = ?) and pswd= ?",
						vals: _dump([name, name, pswd])
					}, function(d) {
                        // alert(_dump(d));
						if(d.success && d.data && d.data.length) {
							// if(d.data[0].pswd != self.password.trim()) return mui.toast('密码输入错误');
							// console.log(d.data[0].orgName);
							mui.toast(d.data[0].name + "，欢迎登陆!");
							
							var userInfo = d.data[0];
							userInfo.userType = 0; // 个人登陆
							_set('userInfo',_dump(userInfo));
						
							mui.fire(plus.webview.getWebviewById('index'), 'loginBack', {
                                tp: "person"
                            });
						
							setTimeout(function() {
								mui.back();
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
							// if(d.data[0].pswd != self.password.trim()) return mui.toast('密码输入错误');
							mui.toast(d.data[0].name+"，欢迎登陆");
					
							var userInfo = d.data[0];
							userInfo.userType = 1; // 组织登陆
							_set('userInfo', _dump(userInfo));
					
							mui.fire(plus.webview.getWebviewById('index'), 'loginBack', {
                                tp: "organization"
                            });
					
							setTimeout(function() {
								mui.back();
							}, 1500);
						} else {
							mui.toast("组织账号登录失败");
						}
					});
				}

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

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

