(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#approve",
			data: {
				userInfo: null,
				examines: []
			},
			methods: {
                openActivity: function(i) {
					openWindow('activeDetail.html', 'activeDetail', {
						activityId: i.id,
						isAdmin: true,
						isSub: true
					});
                },
                operateActivity: function(i, idx) {
					var self = this,
						buttons = [
							{
								title: "通过"
							},
							{
								title: "打回"
							}
						];
					plus.nativeUI.actionSheet({
						title: "活动操作",
						cancel: "取消",
						buttons: buttons
					}, function(e) {
						if (e.index == 0) return;
						if (buttons[e.index-1].title == "通过") {
							mui.confirm("确定通过？", "提示", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									_callAjax({
										cmd: "exec",
										sql: "update activitys set ifValid = 4 where id = ?",
										vals: _dump([i.id,])
									}, function(d) {
										mui.toast("通过"+(d.success?"成功":"失败"));
										if (d.success) self.examines = _del_ele(self.examines, idx);
									});
								}
							});
						} else {
							mui.confirm('<input type="text" id="withdraw" />', "打回", ["确定", "取消"], function(e) {
								if (e.index == 0) {
									var txt = _trim(document.getElementById("withdraw").value);
									if (!txt) {
										mui.toast("请输入理由");
										return false;
									}

									_callAjax({
										cmd: "exec",
										sql: "update activitys set ifValid = 2, withdrawTxt = ? where id = ?",
										vals: _dump([txt, i.id])
									}, function(d) {
										mui.toast("打回"+(d.success?"成功":"失败"));
										if (d.success) self.examines = _del_ele(self.examines, idx);
									});
								}
							}, 'div')
						}
					});
                },
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
				var self = this;
				// 获取子部门提交的活动
				_callAjax({
					cmd: "fetch",
					sql: "select a.id, a.title, o.name as orgName from activitys a, organization o where a.orgId = o.id and a.ifValid = 3 and a.orgId in (select id from organization where superOrgNo = ?)",
					vals: _dump([self.userInfo.no,])
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.examines = d.data;
					}
				});
				// 获取民主评议
			}
		});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
