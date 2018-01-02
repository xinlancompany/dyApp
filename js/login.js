//预加载页面
mui.init({
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	
}
var login = new Vue({
	el: '#login',
	data: {
		username: '',  //账号
		password: '',  //密码
	},
	methods: {
		//登录
		login:function(){
			var self = this;
			
			//如果是党员
			if(self.username == "邓念"){
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, pswd, img from User where name = ?",
					vals: _dump([self.username.trim()])
				}, function(d) {
					if(d.success && d.data) {
						if(d.data[0].pswd != self.password.trim()) return mui.toast('密码输入错误');
						mui.toast("登录成功");
						
						
						var userInfo = d.data[0];
						_set('userInfo',_dump(userInfo));
						
						mui.fire(plus.webview.getLaunchWebview(), 'loginBack');
						
						setTimeout(function() {
							mui.back();
						}, 1500);
					} else {
						mui.toast("账号不存在");
						
					}
				})
			}else {
				//如果是组织
			}

		}
	},
	mounted: function() {
		var self = this;
	
	}
})
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

