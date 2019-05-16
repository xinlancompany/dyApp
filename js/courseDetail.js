(function() {
	var plusReady = function() {
        mui.init({
            beforeback: function() {
				$("#content").empty();
				if (!!vm.intervalCb) clearInterval(vm.intervalCb);
            },
            gestureConfig:{
			   longtap: true, //默认为false
		  	}
	    });

		// 获取详情页id
		var wb = plus.webview.currentWebview()
		if ("cid" in wb) vm.cid = wb.cid;

		var vm = new Vue({
			el: "#courseDetail",
			data: {
				cid: 0,
				newsData: {
					title: ''
				},
				userInfo: null,
				noNeedToUpdate: false,
				mediaRoot: "",
				intervalCb: null
			},
			methods: {
				courseEnroll: function() {
				    // 视频结束或者停止时，不记时
				    if ($("video").length) {
                        var v = $("video")[0];
                        if (v.ended || v.paused) return;
				    }
					if (this.noNeedToUpdate) return;
					var self = this,
					   aScore = 30;
					// 图文信息一次性加分即可
					if (!$("video").length) aScore = 60;
                    self.newsData.ecredit += aScore;
					if (self.newsData.ecredit >= self.newsData.credit) {
						self.newsData.ecredit = self.newsData.credit;
						self.noNeedToUpdate = true;
					}

                    _getTodayScore(this.userInfo, function(score) {
                        if (score >= 120*60) return;
                        score += aScore;
                        if (score > 120*60) score = 120*60;
                        _callAjax({
                            cmd: "exec",
                            sql: "replace into courseEnroll(credit, courseId, userId) values(?, ?, ?)",
                            vals: _dump([self.newsData.ecredit, self.newsData.id, self.userInfo.id])
                        }, function(_d) {
                            if (d.success) {
                                _set("score", _dump({
                                    score: score,
                                    date: _today()
                                }));
                                mui.toast("增加"+parseFloat(aScore/60.0)+"学分");
                            }
                        });
                    });
				},
				getNewsData: function(i) {
					if (!i) return;
					// 防止courseDetail未注销情况下，noNeedToUpdate依然为true，导致无法计时
					this.noNeedToUpdate = false;
					var self = this;
					_callAjax({
						cmd: "fetch",
						sql: "select c.id, title, c.url, c.img, content, readcnt, reporter, newsdate, c.credit, e.credit as ecredit, l.name as lname from linkers l, courses c left join courseEnroll e on e.courseId = c.id and e.userId = ? where c.id = ? and c.linkerId = l.id",
						vals: _dump([self.userInfo.id, i])
					}, function(d) {
						if (d.success && d.data) {
							// 清理已存在的interval
							if (!!self.intervalCb) clearInterval(self.intervalCb);

							$(".mui-title").text(d.data[0].lname);
							self.newsData = d.data[0];
							self.newsData.ecredit = parseInt(self.newsData.ecredit);
							// 文章2分钟，视频20分钟
							// 判断是否为视频
                            if ($(d.data[0].content).find("video").length) {
                                self.newsData.credit = 20*60;
                                // 视频半分钟以上，算学习一次
                                self.intervalCb = setInterval(function() {
                                    self.courseEnroll();
                                }, 30000);
                            } else {
                                // 文章分数统一为1分钟
                                self.newsData.credit = 60;
                                self.intervalCb = setTimeout(function() {
                                    self.courseEnroll();
                                }, 10000);
                            }
                            // 
//							self.newsData.credit = parseInt(self.newsData.credit);
							if (self.newsData.url.indexOf("http") == 0) {
								openOutlink(self.newsData.url, self.newsData.title, "courseDetail");
								return;
							}
							if (!self.newsData.ecredit) self.newsData.ecredit = 0;
							if (self.newsData.ecredit == self.newsData.credit) self.noNeedToUpdate = true;

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

					// 增加阅读数
					_callAjax({
						cmd: "exec",
						sql: "update courses set readcnt = readcnt + 1 where id = "+self.cid
					}, function(_d) {});

				},
				shareSystem: function(type, i, sid, e) {
					// 用于logo
					if (!i.img) i.img = "http://develop.wifizs.cn/static/zsdyPR/img/logo.jpg";
					share(type, i.id, i.title, i.img, sid, e);
				}
			},
			watch: {
				cid: function(i) {
					this.getNewsData(i);
				}
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));

				// 获取媒体根路径
				var self = this;
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
			}
		});

		// 用于预加载时的事件触发
		window.addEventListener("courseId", function(e) {
			$("#content").empty();
			vm.newsData.title = "";
			vm.newsData.reporter = "";
			vm.newsData.readcnt = "";
			vm.newsData.content = "";
			//  解决重复打开文章出现空白页的情况
			if (vm.cid == e.detail.cid) vm.getNewsData(e.detail.cid);
			vm.cid = e.detail.cid;
		});
		
		$('#navbarShareBtn').click(function() {
	    	plus.nativeUI.actionSheet({
	            title: "分享到",
	            cancel: "取消",
	            buttons: [{title:"微信好友"},{title:"微信朋友圈"},{title:"QQ好友"}]
	        }, function(e){
	        	if(e.index == 1) return vm.shareSystem('courses', vm.newsData, 'weixin', 'WXSceneSession');
	        	if(e.index == 2) return vm.shareSystem('courses', vm.newsData, 'weixin', 'WXSceneTimeline');
	        	if(e.index == 3) return vm.shareSystem('courses', vm.newsData, 'qq', null);
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
	};
	
	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
