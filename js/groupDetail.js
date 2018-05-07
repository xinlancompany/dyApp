(function() {
	var plusReady = function() {
		var vm = new Vue({
			el: "#groupDetail",
			data: {
				userInfo: null,
				inf: {
					id: -1,
					name: ""
				},
				curGroupid: 0,
				groups: [],
				users: []
			},
			computed: {
				filterUsers: function() {
					var self = this;
					return _filter(function(i) {
						return self.curGroupid == 0 || i.groupId == self.curGroupid || (self.curGroupid == -1 && i.groupId == 0);
					}, self.users);
				}
			},
			methods: {
			},
			created: function() {
				this.userInfo = _load(_get("userInfo"));
				var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name, groupId from user where ifValid >= 1 and orgNo = ?",
					vals: _dump([self.userInfo.no,])
				}, function(d) {
					if (d.success && d.data) {
						d.data.forEach(function(i) {
							i.groupId = parseInt(i.groupId);
							i.ifSelected = i.groupId == self.inf.id;
							self.users.push(i);
						});
					}
//					alert(_dump(self.users));
				});
			}
		});

		$(".groupBtn").click(function() {
			var newUserIds = _map(function(i) {
				return i.id;
			}, _filter(function(i) {
				return i.ifSelected;
			}, vm.users)),
				self = this,
				groupName = _trim(vm.inf.name);
			if (!groupName) return mui.toast("请输入小组名称");
			if (!newUserIds.length) return mui.toast("请选择组员");
			if (vm.inf.id > 0) {
				_callAjax({
					cmd: "multiFetch",
					multi: _dump([
						{
							key: "name",
							sql: "update groups set name = '"+groupName+"' where id = "+vm.inf.id
						},
						{
							key: "del",
							sql: "update user set groupId = 0 where groupId = "+vm.inf.id
						},
						{
							key: "add",
							sql: "update user set groupId = "+vm.inf.id+" where id in ("+newUserIds.join(",")+")"
						}
					])
				}, function(d) {
					mui.toast("更新"+(d.success?"成功":"失败"));
					if (d.success) {
						setTimeout(function() {
							// 更新列表
							mui.fire(plus.webview.getWebviewById('group'), 'refresh');
							mui.back();
						}, 1500);
					}
				});
			} else {
				_callAjax({
					cmd: "exec",
					sql: "insert into groups(name, orgNo, orgName) values(?,?,?)",
					vals: _dump([groupName, vm.userInfo.no, vm.userInfo.name])
				}, function(d) {
					if (!d.success || !d.data) {
						return mui.toast("无法建立分组");
					} else {
						_callAjax({
							cmd: "exec",
							sql: "update user set groupId = "+d.data+" where id in ("+newUserIds.join(",")+")"
						}, function(d2) {
							mui.toast("新建"+(d.success?"成功":"失败"));
							if (d.success) {
								// 更新列表
								mui.fire(plus.webview.getWebviewById('group'), 'refresh');
								mui.back();
							}
						});
					}
				});
			}
		});

        var wb = plus.webview.currentWebview();
        	if ("inf" in wb) {
        		vm.inf = wb.inf;
			$(".groupBtn").text("更新");
        	}
        	if ("groups" in wb) vm.groups = wb.groups;
        	vm.groups.push({
        		id: -1,
        		name: "未分组"
        	});
	};

	if(window.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}
}());
