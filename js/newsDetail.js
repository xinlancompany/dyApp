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

            if (!!newsDetail.intervalCb) clearInterval(newsDetail.intervalCb);
		},
		gestureConfig:{
		   longtap: true, //默认为false
	  	}
	});
	
	var newsId = 0,
        table = '',
        wb = plus.webview.currentWebview();
	
	var newsDetail = new Vue({
		el: '#newsDetail',
		data: {
			newsData: [],  //新闻内容
            userInfo: null, // _load(_get("userInfo"))
            mediaRoot: "",
            intervalCb: null,
		},
		methods: {
		    newsEnroll: function() {
		        // 增加学分
		        if (!this.userInfo || !!this.userInfo.no) return;
                _getTodayScore(this.userInfo, (score) => {
                    if (score >= 120*60) return;
                    score += 60;
                    if (score > 120*60) score = 120*60;
                    _scoreAjax({
                        cmd: "fetch",
                        sql: "select id from newsEnroll where (userId = ? or idno = ?) and newsId = ?",
                        vals: _dump([this.userInfo.id, this.userInfo.idNo, this.newsData.id])
                    }, (d) => {
                        if (d.success && d.data && d.data.length) return;
                        _scoreAjax({
                            cmd: "exec",
                            sql: "insert into newsEnroll(userId, idno, newsId, credit) values(?,?,?,?)",
                            vals: _dump([this.userInfo.id, this.userInfo.idNo, this.newsData.id, 60])
                        }, (d) => {
                            _set("score", _dump({
                                score: score,
                                date: _today()
                            }));
                            mui.toast("增加1学分");
                        });
                    });
                });
		    },
			//获取新闻内容
			getNewsData: function() {
				var self = this;

				_callAjax({
					cmd: "fetch",
					sql: "select id, title, img, url, brief, content, linkerId, reporter, readcnt, newsdate, subtitle, url from "+(!!table?table:"articles")+" where ifValid =1 and id = ?",
					vals: _dump([newsId])
				}, function(d) {
					if(d.success && d.data) {
						if (d.data[0].url.indexOf('http') == 0) {
							openOutlink(d.data[0].url, d.data[0].title, "newsDetail");
							return;
						}
						self.newsData = d.data[0];

						// 文件页面内部图片为相对路径，需要拼接
						self.$nextTick(function() {
							$("img,video").each(function() {
								var im = $(this).attr("src");
								if (!!im && im.indexOf("http") == -1) $(this).attr("src", self.mediaRoot+im);
							});

							// IOS下设置video横屏
							if ("Android" != plus.os.name) {
								var v = $("video")[0];
								if (!v) return;
								v.addEventListener("webkitbeginfullscreen", function() {
									plus.screen.lockOrientation('landscape');
								});
								v.addEventListener('webkitendfullscreen', function() {
									plus.screen.lockOrientation('portrait');
								});
							}
						});
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
            },
			shareSystem: function(type, i, sid, e) {
				// 用于logo
				if (!i.img) i.img = "http://develop.wifizs.cn/static/zsdyPR/img/logo.jpg";
				share(type, i.id, i.title, i.img, sid, e);
			},
		},
		created: function() {
			var self = this;
	
			newsId = _get('newsId');
			//获取动态新闻
            if (!!newsId) {
                self.getNewsData();
            }

			//  获取userInfo
			var userInfoStr = _get("userInfo");
			if (userInfoStr) this.userInfo = _load(userInfoStr);

			// 获取媒体根路径
			_replaceAjax({
				cmd: "imgRoot",
			}, function(d) {
				if (d.success && d.data) self.mediaRoot = d.data;
			});

			// 视频全屏幕时的横屏播放
			// 安卓
			if ("Android" === plus.os.name) {
				wb.setStyle({
					videoFullscreen: "landscape"
				});
			}
			// IOS需要在页面加载后绑定

            this.intervalCb = setTimeout(function() {
                newsDetail.newsEnroll();
            }, 10000);
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

    var aid = wb.aid;
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
    
    $('#navbarShareBtn').click(function() {
    	plus.nativeUI.actionSheet({
            title: "分享到",
            cancel: "取消",
            buttons: [{title:"微信好友"},{title:"微信朋友圈"},{title:"QQ好友"}]
        }, function(e){
        	if(e.index == 1) return newsDetail.shareSystem('articles', newsDetail.newsData, 'weixin', 'WXSceneSession');
        	if(e.index == 2) return newsDetail.shareSystem('articles', newsDetail.newsData, 'weixin', 'WXSceneTimeline');
        	if(e.index == 3) return newsDetail.shareSystem('articles', newsDetail.newsData, 'qq', null);
        })
    })
    
    mui('#article').on('longtap', 'img', function() {
    	var src = $(this).attr('src');
    	plus.nativeUI.actionSheet({
            title: "操作",
            cancel: "取消",
            buttons: [{title:"保存到相册"}]
        }, function (e) {
        	if(e.index == 0) return false;
        	plus.gallery.save( src, function(){
        		mui.toast('保存成功');
        	}, function() {
        		mui.toast('保存失败');
        	} );
        })
    })
    
    mui('#article').on('tap', 'img', function() {
    	var src = $(this).attr('src');
		plus.nativeUI.previewImage([src])
    })
}
// 判断扩展API是否准备，否则监听'plusready'事件
if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}

