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
			url: 'index.html',
			id: 'index'
		},],
	});
	var boot = new Vue({
		el: '.boot',
		data: {
			link: '',
			time: 7
		},
		methods: {
			openIndex: function() {
				openWindow('index.html', 'index');
				clearInterval(ck);
				
				var userInfo = _load(_get('userInfo'));
				if(userInfo != null && userInfo.name){
					//若已登录 显示欢迎信息
					mui.toast(userInfo.name+"\n欢迎您!");
				}
			}
		},
		created: function() {
			var self = this;
			console.log("启动页");
			//获取启动页
			_callAjax({
				cmd: "fetch",
				sql: "select homepage from system"
			}, function(d) {
				_tell(d.data);
				if(d.success && d.data) {
					self.link = d.data[0].homepage;
					console.log(self.link);
				}	
				
				ck = setInterval(function() {
					boot.time--;
					if(boot.time == 0) {
						openWindow('index.html', 'index');
						self.openIndex();
					};
				}, 1000)
			})
		}
	})
}
