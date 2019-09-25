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
            isAdmin: false,
            isNews: true,
            subOrgs: [],
		},
		methods: {
			//跳转到新闻详情
			gotoDetail: function(i) {
				if (this.isAdmin && lid == linkerId.Notice) {
					// 书记打开看未读人数
					openWindow("orgNoticeDetail.html", "orgNoticeDetail", {
						aid: i.id,
					});
				} else {
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);
					_set("newsId", i.id);
					//触发详情页面的newsId事件
					mui.fire(plus.webview.getWebviewById("newsDetail"), 'newsId', {});
					openWindow("newsDetail.html", "newsDetail");
				}
			},
	
			getMoreNews: function() {
				this.getNews(lid, no);
			},
			//获取动态新闻
			getNews: function(lid, orgNo) {
                // 如果没有lid则打开新闻列表
                if (!lid) lid = linkerId.News;

				var self = this;
				var f = 10e6;
				var ndate = '3000-12-31 23:59:59';
				if(self.newsList.length) {
					var ii = _at(self.newsList, -1);
					f = ii.id;
					ndate = ii.newsdate;
				}

                var sql = "select id, title, url, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) order by newsdate desc, id desc limit 10",
                    vals =  _dump([lid, ndate, ndate, f]);

                if (!!orgNo) {
                    if (lid == 141) {
                        sql = "select id, title, url, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) and reporter in (?, '033000000018') order by newsdate desc, id desc limit 10";
                    } else {
                        sql = "select id, title, url, img, content, linkerId, reporter, readcnt, newsdate, subtitle from articles where ifValid = 1 and linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) and reporter = ? order by newsdate desc, id desc limit 10";
                    }
                    vals =  _dump([lid, ndate, ndate, f, orgNo]);
                }
	
				_callAjax({
					cmd: "fetch",
					sql: sql,
					vals: vals
				}, function(d) {
					if(d.success && d.data) {
						self.bHaveMore = true;
						d.data.forEach(function(r) {
							if(r.img == '') {
								r.img = "../img/default.png";
							}
							self.newsList.push(r);
						});
						_tell("---------------------");
						_tell(self.newsList);
						_tell("---------------------");
					} else {
						self.bHaveMore = false;
						if(f != 10e5) {
							mui.toast("已全部加载完毕");
						}
					}
				})
			},

            // 删除新闻
            delArticle: function(i, idx) {
                var self = this;
                mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
                    if (e.index == 0) {
                        _callAjax({
                            cmd: "exec",
                            sql: "update articles set ifValid = 0 where id = ?",
                            vals: _dump([i.id,])
                        }, function(d) {
                            if (d.success) {
                                self.newsList = _del_ele(self.newsList, idx);
                            }
                        });
                    }
                });
            },
	
            // 编辑新闻
            editArticle: function(i) {
                var t;
                if (lid == linkerId.Rules) t = "编辑规章制度";
                if (lid == linkerId.Notice) t = "编辑通知";
                openWindow("articleUpload.html", "articleUpload", {
                    lid: lid,
                    reporter: no,
                    title: t,
                    aid: i.id,
                    title: i.title,
                    content: i.content
                });
            },

            // 推送消息
            _push: function(i) {
                var multi = _map(function(k) {
                    return {
                        key: "push"+parseInt(Math.random()*10e6),
                        sql: "insert into articles(title,img,content,linkerId,reporter) values('"+i.title+"', '"+i.img+"', '"+i.content+"', "+i.linkerId+", '"+k.no+"')"
                    };
                }, this.subOrgs);
                multi.push({
                    key: "update",
                    sql: "update articles set subtitle = 'pushed' where id = "+i.id
                });
                // 设置以免重复推送
                i.subtitle = "pushed";
                _callAjax({
                    cmd: "multiFetch",
                    multi: _dump(multi)
                }, function(d) {
                    mui.toast("推送"+(d.success?"成功":"失败"));
                });
            },

            askToPush: function(i) {
                var self = this;
                mui.confirm("是否推送下一级？", "提示", ["确定", "取消"], function(e) {
                    if (e.index == 0) {
                        self.pushArticle(i);
                    }
                });
            },
            
            pushArticle: function(i) {
                if (i.subtitle == "pushed") {
                    mui.toast("该文章已经推送过");
                    return;
                }
                var self = this;
                if (!self.subOrgs.length) {
                    _callAjax({
                        cmd: "fetch",
                        sql: "select no from organization where superOrgNo = ?",
                        vals: _dump([no,])
                    }, function(d) {
                        if (d.success && d.data && d.data.length) {
                            self.subOrgs = d.data;
                            self._push(i);
                        } else {
                            mui.toast("无下级支部可推送");
                        }
                    });
                } else {
                    self._push(i);
                }
            },
		},
		mounted: function() {
			var self = this;
			// 获取动态新闻
			// self.getNews();

			// 下拉刷新
			pullToRefresh();
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
            // newsList.isAdmin = "no" in userInfo;
        // alert(lid+" -- "+linkerId.Rules);
        if (newsList.isAdmin && !newsList.isNews) {
            $("#newArticle").show();
            $("#newArticle").click(function() {
                var t;
                if (lid == linkerId.Rules) t = "新增规章制度";
                if (lid == linkerId.Notice) t = "新增通知";
                openWindow("articleUpload.html", "articleUpload", {
                    lid: lid,
                    reporter: no,
                    title: t
                });
            });
        } else {
            $("#newArticle").hide();
        }
        newsList.getNews(lid, orgNo);
    };

    var wb = plus.webview.currentWebview(),
        lid = wb.linkerId;
    var userInfoStr = _get("userInfo"),
    	// localstorage中的userInfo为空的情况下 userInfo设置成空的对象
        userInfo = userInfoStr == '' ? {} : _load(userInfoStr);
    var no = null;
    if ("isAdmin" in wb) {
        newsList.isAdmin = wb.isAdmin;
        newsList.isNews = wb.lid == linkerId.IndexNews;
    } else {
        newsList.isAdmin = "no" in userInfo;
    }
    if (lid) {
        if ("orgNo" in wb) no = wb.orgNo;
        updateNewsList(lid, no);
    }
        

    // 添加newList自定义监听事件
    window.addEventListener('newList', function(event) {
        var lid = event.detail.linkerId;
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

    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(this).height();
        if (scrollTop + windowHeight == scrollHeight && newsList.bHaveMore) {
            // 底部自动加载
            newsList.getNews(lid, no);
        }
    });
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

