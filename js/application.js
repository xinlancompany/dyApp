(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#application",
			data: {
				id: 0,
				content: "",
				imgStyle: {
					backgroundImage: "",
				},
				img: "",
				userInfo: {
					userType: 0
				},
				score: 3,
				reason: "",
				ifValid: -1,
			},
			watch: {
				id: function(i) {
					if (!i) return;
					var self = this;
					_callAjax({
						cmd: "fetch",
						sql: "select content, img, score, reason, ifValid from easyScore where id = ?",
						vals: _dump([self.id,])
					}, function(d) {
						if (d.success && d.data) {
							var inf = d.data[0];
							self.content = inf.content;
							self.img = inf.img;
							self.imgStyle.backgroundImage = "url("+self.img+")";
							self.score = inf.score;
							self.reason = inf.reason;
							self.ifValid = inf.ifValid;
						}
					});
				}
			},
			methods: {
				uploadImg: function(evt) {
					var self = this;
					plus.nativeUI.showWaiting('上传中...')
					uploadImage("application", evt, function(r) {
						plus.nativeUI.closeWaiting();
						self.img = serverAddr+'/upload/pic/application/'+r.thumb;
						self.imgStyle.backgroundImage = "url("+self.img+")";
					});
				},
				submitApplication: function() {
					var self = this,
						content = _trim(self.content);
					if (!content) return mui.toast("请填写内容");
					var sql = "insert into easyScore(userId, content, img, score, orgNo, ifValid) values(?,?,?,?,?,?)",
						vals = _dump([self.userInfo.id, content, self.img, self.score, self.userInfo.orgNo, 1]);
					if (wb.uid) {
						// 书记直接登记
						vals = _dump([wb.uid, content, self.img, self.score, wb.orgNo, wb.validVal]);
					}
					if (self.id) {
						sql = "update easyScore set content = ?, img = ?, score = ? where id = ?";
						vals = _dump([content, self.img, self.score, self.id]);
					}
					_callAjax({
						cmd: "exec",
						sql: sql,
						vals: vals
					}, function(d) {
						mui.toast("提交"+(d.success?"成功":"失败"));
						if (d.success && d.data) {
							setTimeout(function() {
								mui.back();
							}, 1500);
						}
					});
				},
				operateApplication: function() {
					
				},
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
//				alert(_dump(this.userInfo));
			}
		});

		var wb = plus.webview.currentWebview();
		if ("aid" in wb) vm.id = wb.aid;
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
