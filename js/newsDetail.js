// 扩展API加载完毕，现在可以正常调用扩展API
function plusReady() {
	//预加载页面
	mui.init({
		preloadPages: [{
			url: '',
			id: '',
		}],
		beforeback: function() {
			// 页面返回前关闭所有视频播放
			$('video').each(function() {
				$(this)[0].pause();
			})
			$('body').animate({scrollTop:0})
			newsDetail.newsData = []
		}
	});
	
	var newsId = 0;	
	
	var newsDetail = new Vue({
		el: '#newsDetail',
		data: {
			newsData: [],  //新闻内容
		},
		methods: {
			//获取新闻内容
			getNewsData: function() {
				var self = this;

				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, brief, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid =1 and id = ?",
					vals: _dump([newsId])
				}, function(d) {
					_tell(d.data);
					if(d.success && d.data) {
						self.newsData = d.data[0];
				
					}
				});
			},
		},
		mounted: function() {
			var self = this;
	
			newsId = _get('newsId');
			console.log("newsId111="+newsId);
			//获取动态新闻
			self.getNewsData();
		}
	})
	
	//添加newId自定义事件监听
	window.addEventListener('newsId', function(event) {
		//获得事件参数
		newsId = _get('newsId');
		newsDetail.getNewsData();
	})
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

