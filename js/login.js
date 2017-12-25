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
			
			_callAjax({
				cmd:"fetch",
				sql:"select id, name, img from User where name = ? and pswd = ?",
				vals: _dump([self.username.trim(), self.password.trim()])
			},function(d){
				if(d.success && d.data){
					mui.toast("登录成功");
				}
			})
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

