(function() {
    var plusReady = function() {
        mui.init({
            beforeback: function() {
                mui.fire(plus.webview.getWebviewById("activityUpload"), "selectAbsents", {
                    absents: _filter(function(i) {
                    		return i.reason != '';
                    }, vm.users)
                });
            }
        });

        var userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#selectAbsents",
            data: {
                users: [],
                groups: [],
                curGroupid: 0,
                reasons: [],
                curReasonId: -1,
                otherReason: '',
                absents: [],
            },
            computed: {
				filterUsers: function() {
					var self = this;
					return _filter(function(i) {
						return self.curGroupid == 0 || i.groupId == self.curGroupid || (self.curGroupid == -1 && i.groupId == 0);
					}, self.users);
				}
            },
            watch: {
            		curReasonId: function(i) {
            			if (i < 0) return;
            			var r = this.curReasonId == this.reasons.length ? this.otherReason : this.reasons[this.curReasonId];
            			if (r =='') r = "其他";
            			this.filterUsers.forEach(function(i) {
            				i.ifSelect = i.reason == r;
            			});
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
                },
                updateAbsentReason: function(i) {
                		var orn = this.otherReason == ""?'其他':this.otherReason;
                		if (i.ifSelect) {
                			i.reason = this.curReasonId == this.reasons.length ? orn : i.reason = this.reasons[this.curReasonId];
                		} else {
                			i.reason = '';
                		}
                },
                getUsers: function() {
					_callAjax({
						cmd: "fetch",
						sql: "select id, name, groupId from User where ifValid > 0 and orgNo = ?",
						vals: _dump([userInfo["no"],])
					}, function(d) {
						if (!d.success || !d.data) return;
						d.data.forEach(function(i) {
							i.reason = '';
							i.ifSelect = false;
							wb.absents.forEach(function(j) {
								if (j.id == i.id) {
									i.reason = j.reason;
								}
							});
							i.isIn = false;
							wb.notIn.forEach(function(j) {
								if (j.id == i.id) {
									i.isIn = true;
								}
							});
							if (!i.isIn) vm.users.push(i);
						});
						vm.curReasonId = 0;
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
					}
				});

				// 获取缺席理由
				_callAjax({
					cmd: "fetch",
					sql: "select reason from absentReasons"
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.reasons = _map(function(i) {return i.reason}, d.data);
						self.getUsers();
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
        vm.absents = wb.absents;

    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
