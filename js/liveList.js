//预加载页面
/*
mui.init({
	preloadPages: [{
		url: 'liveDetail.html',
		id: 'liveDetail'
	}],
});
*/

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var liveList = new Vue({
		el: '#liveList',
		data: {
			lives:[],
			bHaveMore: false,
		},
		methods: {
			//跳转到直播课堂详情
			goLiveDetail: function(i) {
                /*
				var userInfo = _load(_get('userInfo'));
			
				if(userInfo) {
					_set("livecourseId", i.id);
					mui.fire(plus.webview.getWebviewById("liveDetail"), 'livecourseId', {});
			
					openWindow("views/liveDetail.html", "liveDetail");
				} else {
					openWindow("login.html", "login");
				}
			    */
                // _set("livecourseId", i.id);
                openWindow("liveDetail.html", "liveDetail", {
                    liveId: i.id
                });
			},
			
			//获取课件列表
			getLiveList: function(){
				var self = this;
				var f = 10e5;
				if(self.lives.length) {
					f = _at(self.lives, -1).id;
				}
				
                // 分支部课件，感觉不是很现实
				// var orgId = _getOrgId();
				_callAjax({
					cmd:"fetch",
					// sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(e.id) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where ifValid =1 and a.orgId = ? and a.id < ? group by a.id order by a.starttime desc limit 10",
					// vals:_dump([orgId, f])
                    // 统一课件
					sql:"select a.id, a.title, a.img, a.content, a.linkerId, a.url, a.brief, strftime('%Y-%m-%d %H:%M', a.starttime)as starttime, strftime('%Y-%m-%d %H:%M', a.endtime)as endtime, a.status, count(distinct e.userId) as audience from lives a outer left join liveEnroll e on e.liveId = a.id where ifValid =1 and a.id < ? group by a.id order by a.starttime desc limit 10",
					vals:_dump([f,])
				},function(d){
					if(d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r){
							var arrImg = r.img.split('/upload');
							r.img = serverAddr + '/upload' + arrImg[1];
							self.lives.push(r);
						});
					}else {
						self.bHaveMore = false;
						if(f != 10e5){
							mui.toast("已全部加载完毕")
						}
					}
				})
			},
			//初始化操作
			init: function(){
				var self = this;
							
				self.lives = [];
				self.getLiveList();
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


	
