// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

function plusReady() {
	var ck;
	//清除角标
	plus.runtime.setBadgeNumber(0)
	//预加载页面
	mui.init({
		preloadPages: [{
			url: 'views/login.html',
			id: 'login'
		},{
			url: 'index.html',
			id: 'index'
		}],
	});
	var boot = new Vue({
		el: '.boot',
		data: {
			link: '',
			time: 7,
			userInfo: null,
		},
		methods: {
			openIndex: function() {
				if (this.userInfo) {
					mui.fire(plus.webview.getWebviewById("index"), "closeBoot");
					openWindow('index.html', 'index');
				} else {
					mui.fire(plus.webview.getWebviewById("login"), "closeBoot");
					openWindow('views/login.html', 'login');
				}
				clearInterval(ck);
				
//				var userInfo = _load(_get('userInfo'));
				if(this.userInfo != null && this.userInfo.name){
					//若已登录 显示欢迎信息
					mui.toast(this.userInfo.name+"\n欢迎您!");
				}
			}
		},
		created: function() {
			// 判断是否已经登陆
			var userInfoStr = _get("userInfo");
			if (!!userInfoStr) this.userInfo = _load(userInfoStr);

			var self = this;
			//获取启动页
			_callAjax({
				cmd: "fetch",
				sql: "select homepage from system"
			}, function(d) {
				if(d.success && d.data) {
					self.link = d.data[0].homepage;
				}	
				
				ck = setInterval(function() {
					boot.time--;
					if(boot.time == 0) {
                        mui.fire(plus.webview.getWebviewById("index"), "closeBoot");
						openWindow('index.html', 'index');
						self.openIndex();
					};
				}, 1000)
			});
		}
	})
}
