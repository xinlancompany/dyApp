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
	
	var newsId = 0,
        table = '';
	
	var newsDetail = new Vue({
		el: '#newsDetail',
		data: {
			newsData: [],  //新闻内容
            userInfo: _load(_get("userInfo"))
		},
		methods: {
			//获取新闻内容
			getNewsData: function() {
				var self = this;

				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, brief, content, linkerId, reporter, readcnt, newsdate, subtitle from "+(!!table?table:"articles")+" where ifValid =1 and id = ?",
					vals: _dump([newsId])
				}, function(d) {
					_tell(d.data);
					if(d.success && d.data) {
						self.newsData = d.data[0];
					}
				});
			},
            updateReadcnt: function() {
                // 增加阅读数
                _callAjax({
                    cmd: "exec",
                    sql: "update articles set readcnt = readcnt + 1 where id = ?",
                    vals: _dump([newsId,])
                }, function(_d) {
                    // 不干什么
                });
            },
            courseEnroll: function() {
                var self = this;
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump([
                        {
                            key: "update",
                            sql: "update courses set readcnt = readcnt +1 where id = "+newsId
                        },
                        {
                            key: "insert",
                            sql: "insert into courseEnroll(userId, courseId) values("+self.userInfo.id+","+newsId+")",
                        }
                    ])
                }, function(d) {
                    // alert(_dump(d));
                });
            }
		},
		mounted: function() {
			var self = this;
	
			newsId = _get('newsId');
			// console.log("newsId111="+newsId);
			//获取动态新闻
            if (!!newsId) {
                self.getNewsData();
            }
		}
	});
	
	//添加newId自定义事件监听
	window.addEventListener('newsId', function(event) {
		//获得事件参数
		newsId = _get('newsId');
		newsDetail.getNewsData();
        // 增加阅读数
        newsDetail.updateReadcnt();
	});

    // 添加课程事件
	window.addEventListener('courseId', function(event) {
		//获得事件参数
		newsId = _get('newsId');
        table = "courses";
		newsDetail.getNewsData();
	});

    var wb = plus.webview.currentWebview(),
        aid = wb.aid;
    table = wb.table;
    // alert(aid+" "+table);
	if (!!aid && !!table) {
        newsId = aid;
        newsDetail.getNewsData();
        // 半分钟以上，算学习一次
        setTimeout(function() {
            newsDetail.courseEnroll();
        }, 30000);
    } else {
        newsDetail.updateReadcnt();
    }
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

