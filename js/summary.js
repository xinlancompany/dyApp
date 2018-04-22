(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#summary",
			data: {
				season: null,
				curIdx: 0,
				userInfo: null,
				info: [null,null,null,null],
				showInfo: null
			},
			watch: {
				season: function(i) {
					var self = this;
					_summaryAjax({
						cmd: "season",
						orgNo: self.userInfo.no,
						season: self.season
					}, function(d) {
						self.info[0] = d.data[0];
						self.showInfo = d.data[0];
					});
					$(".mui-title").text(i+"季度");
				},
				curIdx: function(i) {
					var self = this;
					if (!this.info[i]) {
						_summaryAjax({
							cmd: "month",
							month: (self.season-1)*3+i,
							orgNo: self.userInfo.no
						}, function(d) {
//							alert(_dump(d));
							self.info[i] = d.data[0];
							self.showInfo = self.info[i];
						});
					} else {
						self.showInfo = self.info[i];
					}
				}
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
			}
		});
		var wb = plus.webview.currentWebview();
		if ("season" in wb) vm.season = wb.season;
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
