(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectParticipants", {
                    participants: _filter(function(i) {
                    		return i.ifSelect
                    }, vm.users)
                });
            }
        });

        var userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#selectUsers",
            data: {
                users: [],
                participants: [],
                groups: [],
                curGroupid: 0,
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
                   if (!i.ifSelect) $("#selectAll").text("全选");
                },
                changeGroup: function(i) {
                		this.curGroupid = i.id;
                		var ifAllSelected = true;
                		for (var i = 0; i < this.filterUsers.length; i += 1) {
                			if (!this.filterUsers[i].ifSelect) {
                				ifAllSelected = false;
                				break;
                			}
                		}
                		if (ifAllSelected) {
                			$("#selectAll").text("全不选");
                		} else {
                			$("#selectAll").text("全选");
                		}
                }
            },
            created: function() {
            		var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name from groups where orgNo = ? and ifValid >= 1",
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
        		if ($("#selectAll").text() == "全选") {
				vm.filterUsers.forEach(function(i) {
					i.ifSelect = true;
				});
				$("#selectAll").text("全不选");
        		} else {
				vm.filterUsers.forEach(function(i) {
					i.ifSelect = false;
				});
				$("#selectAll").text("全选");
        		}
        });

        var wb = plus.webview.currentWebview();
//      if (!wb.aid) vm.participants = wb.participants;
        vm.participants = wb.participants;

//      if (!vm.users.length || !!wb.aid) {
            _callAjax({
                cmd: "fetch",
                sql: "select id, name, groupId from User where ifValid = 1 and orgNo = ?",
                vals: _dump([userInfo["no"],])
            }, function(d) {
                if (!d.success || !d.data) return;
                d.data.forEach(function(i) {
                    i.ifSelect = false;
//                  if (!!wb.aid) {
                        wb.participants.forEach(function(j) {
                            if (j.id == i.id) {
                                i.ifSelect = true;
                            }
                        });
//                  }
					i.isIn = false;
					wb.notIn.forEach(function(j) {
						if (j.id == i.id) {
							i.isIn = true;
						}
					});
					if (!i.isIn) vm.users.push(i);
                });
            });
//      }
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
