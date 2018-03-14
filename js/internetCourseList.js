//预加载页面
mui.init({
	preloadPages: [{
		url: 'internetCourseware.html',
		id: 'internetCourseware'
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
                /*
				var userInfo = _load(_get('userInfo'));
				
				if(userInfo) {
					_set("netcourseId", i.id);
					mui.fire(plus.webview.getWebviewById("internetCourseware"), 'netcourseId', {});
				
					openWindow("internetCourseware.html", "internetCourseware");
				} else {
					openWindow("login.html", "login");
				}
				*/

                var wb = plus.webview.getWebviewById("newsDetail");
                if (!!wb) {
                    // 预加载成功
                    _set("newsId", i.id)
                    mui.fire(wb, "courseId");
                    openWindow("newsDetail.html", "newsDetail");
                } else {
                    // 预加载失败
                    _set("newsId", "");
                    openWindow("newsDetail.html", "newsDetail", {
                        aid: i.id,
                        table: "courses"
                    });
                }
			},
			//获取课件列表
			getInternetList: function(){
				var self = this;
				var f = 10e5;
				if(self.internets.length) {
					f = _at(self.internets, -1).id;
				}
				
				// var orgId = _getOrgId();

				_callAjax({
					cmd:"fetch",
                    // 按部门授课
					// sql:"select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from courses where ifValid =1 and id< ? and linkerId = ? and orgId = "+ orgId + " order by id desc limit 10",
					// vals:_dump([f, linkerId.netCourse])
                    // 统一授课
					sql:"select id, title, img, content, brief, linkerId, reporter, readcnt, newsdate, url from courses where ifValid =1 and id< ? and linkerId = ? order by id desc limit 10",
					vals:_dump([f, linkerId.netCourse])
				},function(d){
					_tell(d);
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
			
		}
	})
	
	internetList.init();
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}
