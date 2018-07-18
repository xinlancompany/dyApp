(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectInvalids", {
                    invalids: _filter(function(i) {
                    		return i.ifSelect;
                    }, vm.users)
                });
            }
        });

        var userInfo = _load(_get("userInfo")),
			wb = plus.webview.currentWebview();

        var vm = new Vue({
            el: "#selectInvalids",
            data: {
                users: [],
                groups: [],
                curGroupid: 0,
                otherReason: '',
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
                showSelects: function(i) {
                    /*
                     * 测试用
                    var self = this;
                    alert(_dump(_map(function(i) {
                        return i.ifSelect;
                    }, self.users)));
                    */
                   i.ifSelect = !i.ifSelect;
                },
                getUsers: function() {
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, groupId from User where ifValid > 0 and orgNo = ?",
						vals: _dump([userInfo["no"],])
					}, function(d) {
						if (!d.success || !d.data) return;
						d.data.forEach(function(i) {
							i.isIn = false;
							wb.notIn.forEach(function(j) {
								if (j.id == i.id) {
									i.isIn = true;
								}
							});
							i.ifSelect = false;
							if (!i.isIn) {
								vm.users.push(i);
								wb.invalids.forEach(function(j) {
									if (j.id == i.id) {
										i.ifSelect = true;
									}
								});
							}
						});
					});
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
						self.getUsers();
					}
				});
            }
        });


    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
