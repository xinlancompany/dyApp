(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#courseList",
			data: {
				news:[],
				bHaveMore: false,
				lid: null
			},
			methods: {
				openCourseDetail: function(i) {
					
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
	};
	
	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());