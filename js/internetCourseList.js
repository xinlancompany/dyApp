//预加载页面
mui.init({
	preloadPages: [{

	}],
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var internetList = new Vue({
		el: '#internetList',
		data: {
			internets:[],
			bHaveMore: false,
		},
		methods: {
			//跳转到网络课堂详情
			gotoNetCourseDetail: function(i) {
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("netcourseId", i.id);
					mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
				
					openWindow("views/internetCourseware.html", "internetCourseware");
				} else {
					openWindow("login.html", "login");
				}
				
			},
			//获取课件列表
			getInternetList: function(){
				var self = this;
				var f = 10e5;
				if(self.internets.length) {
					f = _at(self.internets, -1).id;
				}
				
				_callAjax({
					cmd:"fetch",
					sql:"select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from articles where ifValid =1 and id< ? and linkerId = ? order by id desc limit 10",
					vals:_dump([f, linkerId.netCourse])
				},function(d){
					if(d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							self.internets.push(r);
						
						});
					}else {
						self.bHaveMore = false;
						if(f != 10e5){
							mui.toast("没有更多课件了")
						}
					}
				})
			},
			//初始化操作
			init: function(){
				var self = this;
				self.internets = [];
				self.getInternetList();
				self.bHaveMore = false;
			}
			
		},
		mounted: function() {
			var self = this;
			self.init();
		}
	})
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
