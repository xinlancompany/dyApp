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
			bHaveMore: false,
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
			getNews: function(lid, orgNo) {
                // 如果没有lid则打开新闻列表
                if (!lid) lid = linkerId.News;

				var self = this;
				var f = 10e5;
				if(self.newsList.length) {
					f = _at(self.newsList, -1).id;
				}

                var sql = "select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = ? and id < ? order by id desc limit 10",
                    vals =  _dump([lid, f]);

                if (!!orgNo) {
                    sql = "select id, title, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = ? and id < ? and reporter = ? order by id desc limit 10";
                    vals =  _dump([lid, f, orgNo]);
                }
	
				_callAjax({
					cmd: "fetch",
					sql: sql,
					vals: vals
				}, function(d) {
                    _tell(d);
					if(d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							if(r.img == '') {
								r.img = "../img/default.png";
							}
							self.newsList.push(r);
	
						});
					} else {
						self.bHaveMore = false;
						if(f != 10e5) {
							mui.toast("没有更多新闻了");
						}
					}
				})
			},

            // 新增新闻
            newArticle: function() {
            
            },
	
		},
		mounted: function() {
			var self = this;
			// 获取动态新闻
			// self.getNews();
		}
	});

    var updateNewsList = function(lid, orgNo) {
        _callAjax({
            cmd: "fetch",
            sql: "select name from linkers where id = ?",
            vals: _dump([lid,])
        }, function(d) {
            if (!d.success || !d.data) return;
            $(".mui-title").text(d.data[0].name);
        });

        // 新增文章列表
        var userInfoStr = _get("userInfo"),
            userInfo = _load(userInfoStr);
        // alert(lid+" -- "+linkerId.Rules);
        if (!!userInfoStr && !!parseInt(userInfo.userType) && lid == linkerId.Rules) {
            $("#newArticle").show();
            $("#newArticle").click(function() {
                openWindow("articleUpload.html", "articleUpload", {
                    lid: lid,
                    reporter: no,
                    title: "新增规章制度"
                });
            });
        } else {
            $("#newArticle").hide();
        }
        newsList.getNews(lid, orgNo);
    };

    var wb = plus.webview.currentWebview(),
        lid = wb.linkerId;
    var no = null;
    if (lid) {
        if ("orgNo" in wb) no = wb.orgNo;
        updateNewsList(lid, no);
    }
        

    // 添加newList自定义监听事件
    window.addEventListener('newList', function(event) {
        var lid = event.detail.linkerId;
        // _tell(_get("userInfo"));
        // 修改标题
        if (lid) {
            updateNewsList(lid, no);
        }
    });

    // 新增后刷新
    window.addEventListener("refresh", function(event) {
        // alert("rth");
        var lid = event.detail.linkerId;
        newsList.newsList = [];
        newsList.getNews(lid, no);
    });

}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

