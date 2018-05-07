(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectMC", {
                    MC: _filter(function(i) { return i.id == vm.selectId; }, vm.users)
                });
            }
        });

        var userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#selectMC",
            data: {
                users: [],
                groups: [],
                curGroupid: 0,
                selectId: -1,
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
                showSelects: function() {
                    /*
                     * 测试用
                    var self = this;
                    alert(_dump(_map(function(i) {
                        return i.ifSelect;
                    }, self.users)));
                    */
                }
            },
            created: function() {
            		var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name from groups where orgNo = ?",
					vals: _dump([userInfo.no,])
				}, function(d) {
					if (d.success && d.data) {
						d.data.forEach(function(i) {
							i.id = parseInt(i.id);
							i.groupId = parseInt(i.groupId);
							self.groups.push(i);
						});
						self.groups.push({
							id: -1,
							name: "未分组"
						});
					}
				});
            }
        });

        // 全选
        $("#selectAll").click(function() {
            vm.filterUsers.forEach(function(i) {
                i.ifSelect = true;
            });
        });

        var wb = plus.webview.currentWebview();

		_callAjax({
			cmd: "fetch",
			sql: "select id, name, groupId from User where ifValid = 1 and orgNo = ?",
			vals: _dump([userInfo["no"],])
		}, function(d) {
			if (!d.success || !d.data) return;
			if (wb.MC) vm.selectId = wb.MC.id;
			d.data.forEach(function(i) {
				vm.users.push(i);
			});
		});
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
