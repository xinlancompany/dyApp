(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#courseDetail",
			data: {
				cid: 0,
				newsData: null,
				userInfo: null,
				noNeedToUpdate: false
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
				}
			},
			watch: {
				cid: function(i) {
					if (!i) return;
					var self = this;
					_callAjax({
						cmd: "fetch",
						sql: "select c.id, title, content, readcnt, reporter, newsdate, c.credit, e.credit as ecredit from courses c left join courseEnroll e on e.courseId = c.id and e.userId = ? where c.id = ?",
						vals: _dump([self.userInfo.id, i])
					}, function(d) {
						if (d.success && d.data) {
							self.newsData = d.data[0];
							if (!self.newsData.ecredit) self.newsData.ecredit = 0;
							if (self.newsData.ecredit == self.newsData.credit) self.noNeedToUpdate = true;
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
			created: function() {
				this.userInfo = _load(_get("userInfo"));
			}
		});

		var wb = plus.webview.currentWebview()
		if ("cid" in wb) vm.cid = wb.cid;
	};
	
	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
