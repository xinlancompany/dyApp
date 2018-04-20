(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#application",
			data: {
				content: "",
				imgStyle: {
					backgroundImage: "",
				},
				img: "",
				userInfo: {
					userType: 0
				},
				score: 3
			},
			methods: {
				uploadImg: function(evt) {
					var self = this;
					plus.nativeUI.showWaiting('上传中...')
					uploadImage("application", evt, function(r) {
						plus.nativeUI.closeWaiting();
						self.img = serverAddr+'/upload/pic/application/'+r.thumb;
						console.log(self.img);
//						_tell("img: ---> "+self.img);
						self.imgStyle.backgroundImage = "url("+self.img+")";
					});
				},
				submitApplication: function() {
					var self = this,
						content = _trim(self.content);
					if (!content) return mui.toast("请填写内容");
					_callAjax({
						cmd: "exec",
						sql: "insert into easyScore(userId, content, img, orgNo) values(?,?,?,?)",
						vals: _dump([self.userInfo.id, content, self.img, self.userInfo.orgNo])
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
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
