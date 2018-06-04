(function() {
	var plusReady = function() {
        mui.init({
            beforeback: function() {
            		$("#content").empty();
            },
	    });

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
			},
			methods: {
				courseEnroll: function() {
					if (this.noNeedToUpdate) return;
					var self = this;
						self.newsData.ecredit += 30;
					if (self.newsData.ecredit > self.newsData.credit) {
						self.newsData.ecredit = self.newsData.credit;
						self.noNeedToUpdate = true;
					}
					_callAjax({
						cmd: "exec",
						sql: "replace into courseEnroll(credit, courseId, userId) values(?, ?, ?)",
						vals: _dump([self.newsData.ecredit, self.newsData.id, self.userInfo.id])
					}, function(_d) {});
				},
				getNewsData: function(i) {
					if (!i) return;
					var self = this;
					_callAjax({
						cmd: "fetch",
						sql: "select c.id, title, url, content, readcnt, reporter, newsdate, c.credit, e.credit as ecredit from courses c left join courseEnroll e on e.courseId = c.id and e.userId = ? where c.id = ?",
						vals: _dump([self.userInfo.id, i])
					}, function(d) {
						if (d.success && d.data) {
							self.newsData = d.data[0];
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
							});
						}
					});

					// 增加阅读数
					_callAjax({
						cmd: "exec",
						sql: "update courses set readcnt = readcnt + 1 where id = "+self.cid
					}, function(_d) {});

					// 半分钟以上，算学习一次
					setInterval(function() {
						self.courseEnroll();
					}, 30000);
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
			}
		});

		var wb = plus.webview.currentWebview()
		if ("cid" in wb) vm.cid = wb.cid;

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
	};
	
	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
