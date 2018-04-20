(function() {
    var plusReady = function() {
        var userInfo = _load(_get("userInfo")),
            isAdmin = "no" in userInfo,
            orgNo = isAdmin?userInfo.no:userInfo.orgNo;

        var vm = new Vue({
            el: "#tree",
            data: {
                topOrgNo: orgNo,
                topOrgs: null,
                orgs: [],
                searchWord: "",
                examines: []
            },
            computed: {
            	filterOrgs: function() {
            		var sw = _trim(this.searchWord);
            		if (!sw) return this.orgs;
            		return _filter(function(i) {
            			return i.name.indexOf(sw) >= 0;
            		}, this.orgs);
            	}
            },
            methods: {
                openDetail: function(i) {
                    if (!isAdmin) return mui.toast("仅书记可以查看子组织详情");
                    openWindow("subOrg.html", "subOrg", {
                      	orgId: i.id,
                        orgNo: i.no,
                        orgName: i.name
                    });
                },
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
                openNext: function(i) {
                    var self = this;
                    getOrgs(i.no, function(d) {
                        if (!d.success || !d.data || !d.data.length) return mui.toast("该组织无下属分支");
                        self.orgs = d.data;
                    });
                },
                openPrev: function() {
                    var self = this;
                    var i = self.orgs[0];
                    if (i.no == self.topOrgNo) {
                        return mui.toast("已达现有权限顶级");
                    }
                    if (i.superOrgNo == self.topOrgNo) {
                        self.orgs = self.topOrgs;
                    } else {
                        _callAjax({
                            cmd: "fetch",
                            sql: "select superOrgNo from organization where no in (select superOrgNo from organization where no = ?)",
                            vals: _dump([i.no,])
                        }, function(d) {
                            if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录父节点");
                            getOrgs(d.data[0].superOrgNo, function(d) {
                                if (!d.success || !d.data || !d.data.length) return mui.toast("无法获取上层目录");
                                self.orgs = d.data;
                            });
                        });
                    }
                },
                openTop: function() {
                    this.orgs = this.topOrgs;
                }
            }
        });

        // 初始化
        _callAjax({
            cmd: "fetch",
            sql: "select name, no from organization where no = ?",
            vals: _dump([orgNo,])
        }, function(d) {
            if (d.success && d.data && d.data.length) {
                vm.orgs = d.data;
                vm.topOrgs = d.data;
            }
        });

		// 获取子部门提交的活动
		_callAjax({
			cmd: "fetch",
			sql: "select a.id, a.title, o.name as orgName from activitys a, organization o where a.orgId = o.id and a.ifValid = 3 and a.orgId in (select id from organization where superOrgNo = ?)",
			vals: _dump([orgNo,])
		}, function(d) {
			if (d.success && d.data && d.data.length) {
				vm.examines = d.data;
			}
		});

        var getOrgs = function(no, cb) {
            _callAjax({
                cmd: "fetch",
                sql: "select id, name, no, superOrgNo from organization where superOrgNo = ?",
                vals: _dump([no,])
            }, function(d) {
                cb(d);
            });
        };
    };

    if(window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
}())
