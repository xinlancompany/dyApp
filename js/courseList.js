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
					if (evt.code != "Enter") return;
					if (!sw) mui.toast("请输入搜索标题");
					_callAjax({
						cmd: "fetch",
						sql: "select id, title, newsdate, img from courses where linkerId = "+self.lid+" and title like '%"+sw+"%'"
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
					openWindow("courseDetail.html", "courseDetail", {
						cid: i.id
					});
				},
				getNews: function() {
					var self = this,
						fi = 10e6,
						fn = "3000-12-31 23:59:59";
					if (this.news.length) {
						var i = _at(this.news, -1)["id"];
						fi = i.id;
						fn = i.newsdate;
					}
					_callAjax({
						cmd: "fetch",
						sql: "select id, title, newsdate, img from courses where linkerId = ? and (newsdate < ? or (newsdate = ? and id < ?)) order by newsdate desc limit 10",
						vals: _dump([self.lid, fn, fn, fi])
					}, function(d) {
						if (d.success && d.data) {
							if (d.data.length == 10) self.bHaveMore = true;
							d.data.forEach(function(i) {
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