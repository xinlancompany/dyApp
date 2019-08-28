(function() {
    var plusReady = function() {
        var userInfo = _load(_get("userInfo"));

        var vm = new Vue({
            el: "#delUsers",
            data: {
                users: [],
                groups: [],
                curGroupid: 0,
                reasons: [],
                curReasonId: -1,
                otherReason: '',
            },
            computed: {
				filterUsers: function() {
					var self = this;
					return _filter(function(i) {
						return self.curGroupid == 0 || i.groupId == self.curGroupid || (self.curGroupid == -1 && i.groupId == 0);
					}, self.users);
				},
				toBeDel: function() {
					var self = this;
					return _filter(function(i) {
						return i.reason != '';
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
               confirmToDel: function() {
               	var self = this;
               	if (!self.toBeDel.length) return mui.toast("请选择删除对象");
               	mui.confirm("确定删除？", "提示", ["确定", "取消"], function(e) {
               		if (e.index == 0) {
               			// ifValid为2时，为待审核删除操作
               			_callAjax({
               				cmd: "multiFetch",
               				multi: _dump(_map(function(i) {
               					return {
									key: "key"+parseInt(Math.random()*10e6),
									sql: "update user set ifValid = 2, reason = '"+i.reason+"' where id = "+i.id
               					}
               				}, self.toBeDel))
               			}, function(d) {
               				mui.toast("删除已提交上级审核");
               				setTimeout(function() {
               					mui.back();
               				}, 1500);
               			});
               		}
			   });
               },
               showSelects: function() {
                    /*
                     * 测试用
                    var self = this;
                    alert(_dump(_map(function(i) {
                        return i.ifSelect;
                    }, self.users)));
                    */
                },
                updateAbsentReason: function(i, e) {
                		if ("Android" == plus.os.name) i.ifSelect = ($(e.target).is(":checked"));
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
						sql: "select id, name, groupId from User where ifValid = 1 and orgNo = ?",
						vals: _dump([userInfo["no"],])
					}, function(d) {
						if (!d.success || !d.data) return;
						d.data.forEach(function(i) {
							i.reason = '';
							i.ifSelect = false;
							vm.users.push(i);
						});
						vm.curReasonId = 0;
					});
               },
            },
            created: function() {
            		var self = this;
				_callAjax({
					cmd: "fetch",
					sql: "select id, name from groups where orgNo = ? and ifValid = 1",
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
					sql: "select reason from userDelReasons"
				}, function(d) {
					if (d.success && d.data && d.data.length) {
						self.reasons = _map(function(i) {return i.reason}, d.data);
						self.getUsers();
					}
				});
            }
        });

        // 全选
        $("#del").click(function() {
            vm.confirmToDel();
        });

        var wb = plus.webview.currentWebview();
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}());
