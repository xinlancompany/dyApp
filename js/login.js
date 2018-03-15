//预加载页面
mui.init({
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var login = new Vue({
		el: '#login',
		data: {
            type: 'personal',
			username: '',  //账号
			password: '',  //密码
		},
		methods: {
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
						sql: "select id,name,orgName,orgNo,pswd from User where (idno = ? or phone = ?) and pswd= ?",
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
						} else {
							mui.toast("个人账号不存在");						
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
							mui.toast("组织账号不存在");
						}
					});
				}

			}
		},
		mounted: function() {
			var self = this;
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

