(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#courseList",
			data: {
				news:[],
				bHaveMore: false,
				lid: null,
				searchWord: '',
				showNews: [],
				searchState: false
			},
			methods: {
				searchCourse: function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
					var sw = _trim(this.searchWord),
						self = this;
					if (sw == '') {
						this.showNews = this.news;
						this.searchState = false;
					}
					if (evt.keyCode != 13) return;
					if (!sw) mui.toast("请输入搜索标题");
					_callAjax({
						cmd: "fetch",
						sql: "select id, title, url, newsdate, img from courses where linkerId = "+self.lid+" and title like '%"+sw+"%' and ifValid > 0"
					}, function(d) {
						if (d.success && d.data && d.data.length) {
							self.showNews = d.data;
						} else {
							self.showNews = [];
						}
						self.searchState = true;
					});
				},
				openCourseDetail: function(i) {
					// 打开外链
					if (i.url.indexOf("http") === 0) return openOutlink(i.url, i.title);

					// 如果预加载了，则触发事件
					mui.fire(plus.webview.getWebviewById("courseDetail"), "courseId", {
						cid: i.id
					});
					openWindow("courseDetail.html", "courseDetail", {
						cid: i.id
					});
				},
				getNews: function() {
					var self = this,
						fi = 10e6,
						fn = "3000-12-31 23:59:59";
					if (this.news.length) {
						var i = _at(this.news, -1);
						fi = i.id;
						fn = i.newsdate;
					}
					_callAjax({
						cmd: "fetch",
						sql: "select id, title, url, newsdate, img from courses where linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) and ifValid > 0 order by newsdate desc, id desc limit 10",
						vals: _dump([self.lid, fn, fn, fi])
					}, function(d) {
						if (d.success && d.data) {
							if (d.data.length == 10) self.bHaveMore = true;
							d.data.forEach(function(i) {
								// 通知公告去头图
								if (self.lid == linkerId.PublicNotice) i.img = "";
								self.news.push(i);
							});
							self.showNews = self.news;
						}
					});
				}
			},
			watch: {
				lid: function(i) {
					if (!!i) this.getNews();
				}
			},
			mounted: function() {
				// 下拉刷新
				pullToRefresh();
			}
		});

		var wb = plus.webview.currentWebview();
		if ("lid" in wb) vm.lid = wb.lid;
		if ("name" in wb) $(".mui-title").text(wb.name);

		$(".search-btn").click(function() {
			
		});
	};
	
	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());