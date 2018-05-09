(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#summary",
			data: {
				season: null,
				curIdx: 0,
				userInfo: null,
				info: [null,null,null,null,null],
				showInfo: null,
				isDaq: false
			},
			watch: {
				season: "updateOnSeason",
				curIdx: function(i) {
					var self = this;
					if (!this.info[i]) {
						_summaryAjax({
							cmd: "month",
							month: (self.season-1)*3+i,
							orgNo: self.userInfo.no
						}, function(d) {
							self.info[i] = d.data[0];
							self.showInfo = self.info[i];
						});
					} else {
						self.showInfo = self.info[i];
					}
				},
				userInfo: function(u) {
					if (u.type == "党委" || u.type.indexOf("委员会") > 0) {
						$(".rule-btn").show();
						this.isDaq = true;
					} else {
//						$(".rule-btn").hide();
					}
				}
			},
			methods: {
				updateOnSeason: function(i) {
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
					_summaryAjax({
						cmd: "year",
						orgNo: self.userInfo.no,
						year: _get("year")
					}, function(d) {
						self.info[4] = d.data[0];
					});
				},
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
			}
		});
		var wb = plus.webview.currentWebview();
		if ("season" in wb) vm.season = wb.season;
		
		$('.rule-btn').on('click', function() {
            openWindow("newRule.html", "newRule");
		});

		window.addEventListener("updateOnRuleChange", function() {
			vm.curIdx = 0;
			vm.inf = [null,null,null,null,null];
			vm.updateOnSeason(wb.season);
		});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
