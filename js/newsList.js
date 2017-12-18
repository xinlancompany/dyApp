//预加载页面
mui.init({
	preloadPages: [{
		url: 'newsDetail.html',
		id: 'newsDetail',
	}],
});

// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	var newsList = new Vue({
		el: '#newsList',
		data: {
			newsList: [],
			bHaveMore: true,
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				_set("newsId", i.id);
				//触发详情页面的newsId事件
				mui.fire(plus.webview.getWebviewById("newsDetail"), 'newsId', {});
	
				openWindow("newsDetail.html", "newsDetail");
			},
	
			//获取动态新闻
			getNews: function() {
				var self = this;
				var f = 10e5;
				if(self.newsList.length) {
					f = _at(self.newsList, -1).id;
				}
	
				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and linkerId = ? and id < ? order by id desc limit 10",
					vals: _dump([linkerId.News, f])
				}, function(d) {
					if(d.success && d.data) {
						d.data.forEach(function(r) {
							if(r.img == '') {
								r.img = "../img/default.jpg";
							}
							self.newsList.push(r);
	
						});
					} else {
						self.bHaveMore = false;
						if(f != 10e5) {
							mui.toast("没有更多新闻了")
						}
					}
				})
			},
	
		},
		mounted: function() {
			var self = this;
	
			//获取动态新闻
			self.getNews();
	
		}
	})
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

